import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Helper to get GoogleGenAI client lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// API Route: Scan & Structure Protocol
app.post('/api/ai/scan-protocol', async (req, res) => {
  try {
    const { imageBase64, textInput, rawText, mimeType = 'image/jpeg' } = req.body;
    const inputText = textInput || rawText || '';
    const ai = getGenAI();

    const systemPrompt = `You are a scientific laboratory protocol extraction assistant.
Extract structured protocol data from the provided document/image/text.
CRITICAL INSTRUCTION: DO NOT fabricate missing parameters or measurements. If a value (like volume, incubation time, pH, or concentration) is not explicitly present in the source, set it as "Not specified in source".

Return a strictly valid JSON object with the following schema:
{
  "title": "Protocol Title",
  "objective": "Brief objective or description",
  "category": "Microbiology | Molecular Biology | Biochemistry | Cell Biology | General Laboratory",
  "materials": [
    { "id": "m1", "name": "Name", "amount": "Amount or Not specified in source", "concentration": "Conc or Not specified in source", "unit": "Unit" }
  ],
  "reagents": ["Reagent 1", "Reagent 2"],
  "equipment": ["Equipment 1"],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Detailed step instructions",
      "durationMinutes": 30,
      "timeMinutes": 30,
      "groupName": "Group Name",
      "temperature": "37°C or Not specified in source",
      "centrifugationSpeed": "10,000 x g or Not specified in source",
      "pH": "7.4 or Not specified in source",
      "safetyNotes": "Safety warning if applicable",
      "notes": "Additional notes"
    }
  ],
  "missingParameters": ["List of parameters that were not specified in the source document"]
}`;

    if (!ai) {
      // Fallback response when GEMINI_API_KEY is not set
      const demoData = {
        title: inputText ? 'Extracted Protocol' : 'Agarose Gel Electrophoresis Protocol',
        objective: 'Separation and visualization of DNA fragments in 1% agarose gel.',
        category: 'Molecular Biology',
        materials: [
          { id: 'm1', name: 'Agarose Powder', amount: '1.0 g', concentration: '1%', unit: 'g' },
          { id: 'm2', name: '1X TAE Buffer', amount: '100 mL', concentration: '1X', unit: 'mL' },
          { id: 'm3', name: 'Ethidium Bromide / GelRed', amount: '5 µL', concentration: '10,000X', unit: 'µL' },
        ],
        reagents: ['100 bp DNA Ladder', '6X DNA Loading Dye'],
        equipment: ['Gel Casting Tray', 'Power Supply', 'UV/Blue Light Transilluminator', 'Microwave'],
        steps: [
          {
            stepNumber: 1,
            title: 'Prepare 1% Agarose Solution',
            description: 'Weigh 1.0 g agarose and mix with 100 mL 1X TAE buffer in a flask.',
            durationMinutes: 5,
            timeMinutes: 5,
            groupName: 'Preparation',
            temperature: 'Room Temp',
            centrifugationSpeed: 'Not specified in source',
            pH: '8.0',
            safetyNotes: 'Wear heat-resistant gloves when handling hot flasks.',
            notes: 'Swirl to dissolve before heating.',
          },
          {
            stepNumber: 2,
            title: 'Microwave Heating',
            description: 'Microwave until agarose is completely dissolved and liquid is transparent.',
            durationMinutes: 3,
            timeMinutes: 3,
            groupName: 'Preparation',
            temperature: '100°C',
            centrifugationSpeed: 'Not specified in source',
            pH: 'Not specified in source',
            safetyNotes: 'Beware of superheated liquids erupting.',
            notes: 'Check every 30 seconds.',
          },
          {
            stepNumber: 3,
            title: 'Cast Gel and Load Samples',
            description: 'Cool solution to ~50°C, add nucleic acid stain, pour into tray with comb inserted. Solidify and load DNA samples.',
            durationMinutes: 30,
            timeMinutes: 30,
            groupName: 'Casting & Loading',
            temperature: '50°C',
            centrifugationSpeed: 'Not specified in source',
            pH: 'Not specified in source',
            safetyNotes: 'Handle nucleic acid stain with nitrile gloves.',
            notes: 'Allow 20-30 min for complete gel polymerization.',
          },
          {
            stepNumber: 4,
            title: 'Electrophoresis Run',
            description: 'Run gel at 100V constant voltage for 45 minutes in 1X TAE buffer.',
            durationMinutes: 45,
            timeMinutes: 45,
            groupName: 'Electrophoresis',
            temperature: 'Room Temp',
            centrifugationSpeed: 'Not specified in source',
            pH: 'Not specified in source',
            safetyNotes: 'High voltage hazard - ensure lid is secured.',
            notes: 'Stop run when dye front reaches 75% of gel length.',
          },
        ],
        missingParameters: ['Centrifugation speed', 'Exact sample volumes'],
      };

      return res.json({
        success: true,
        source: 'local_demo',
        data: demoData,
        extractedProtocol: demoData,
      });
    }

    let contents: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents = [
        {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
        { text: systemPrompt + '\nAnalyze this lab protocol image/document and return JSON.' },
      ];
    } else {
      contents = [{ text: systemPrompt + `\nProtocol Text Content:\n${inputText}` }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText);

    return res.json({
      success: true,
      source: 'gemini',
      data: parsed,
      extractedProtocol: parsed,
    });
  } catch (error: any) {
    console.error('Scan protocol error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to scan protocol',
    });
  }
});

// API Route: AI Colony Counting with Gemini Vision
app.post('/api/ai/count-colonies', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', agarType = 'LIGHT' } = req.body;
    const ai = getGenAI();

    if (!ai || !imageBase64) {
      return res.json({
        success: false,
        source: 'local_fallback',
        message: 'Gemini API not configured or image missing',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const systemPrompt = `You are an expert microbiology AI vision assistant.
Analyze this agar plate / petri dish image carefully.
Detect all individual bacterial, yeast, or fungal colonies visible on the agar surface.
Ignore edge reflections, dish walls, labeling markers, and dust particles.

Return ONLY a strictly valid JSON object with the following schema:
{
  "totalCount": number,
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "agarCondition": "Good" | "Overgrown" | "Crowded" | "Desiccated",
  "notes": "Short observation about colony morphology or distribution",
  "colonies": [
    {
      "xPercent": number,
      "yPercent": number,
      "estimatedRadiusPx": number,
      "type": "standard" | "large" | "punctiform" | "clustered"
    }
  ]
}`;

    const contents = [
      {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      },
      { text: systemPrompt },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText);

    return res.json({
      success: true,
      source: 'gemini',
      data: parsed,
    });
  } catch (error: any) {
    console.error('AI colony count error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze colonies with AI vision',
    });
  }
});

// API Route: AI Lab Assistant
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, messages = [], projectContext, conversationHistory = [] } = req.body;
    const ai = getGenAI();

    const lastUserMessage = messages.length > 0 ? [...messages].reverse().find((m: any) => m.role === 'user' || m.sender === 'user') : null;
    const userQuery = prompt || (lastUserMessage ? (lastUserMessage.content || lastUserMessage.text) : '');

    const systemPrompt = `You are MTKmicro AI, an expert contextual laboratory assistant for microbiology, molecular biology, biotechnology, and scientific research.
You assist users with:
- Explaining scientific concepts and formulas
- Summarizing user protocols and notes
- Converting units and interpreting math/calculator results
- Generating experiment checklists and step-by-step guidance

SCIENTIFIC INTEGRITY & TEXT FORMATTING RULES:
1. FORMATTING & TEXT CLEANLINESS:
   - DO NOT use LaTeX math syntax, LaTeX blocks, backslashes, or dollar signs (e.g. do NOT write "\\text{g}", "\\text{mL}", "\\text{KH}_2\\text{PO}_4", "\\frac{a}{b}", or "$34.0 g$").
   - Write all chemical formulas (like KH2PO4 or KH₂PO₄), numbers, and units (like 34.0 g, 500 mL, 37°C) directly in plain, clear, readable text.
   - Use standard clean bullet points (* or -) and standard numbered lists (1., 2.).
2. Clearly distinguish between:
   [EXPLANATION]: Scientific background or concepts
   [CALCULATION]: Mathematical formulas or conversions
   [SOURCE_INFO]: Data provided directly in the user's project
   [AI_SUGGESTION]: Practical tips or ideas
3. FOOD SAFETY & MICROBIOLOGY CONSTRAINTS:
   - NEVER state that a microorganism is definitely present merely because of food type.
   - Use terminology strictly: 'Potential target', 'Suspected organism', 'Relevant hazard', 'Recommended test', 'Requires confirmation', 'Not a confirmed identification'.
   - Do NOT automatically convert a presumptive result into a confirmed identification.
   - Do NOT provide unrestricted pathogen propagation, weaponization, or mass culture optimization instructions.
4. DO NOT fabricate experimental measurements or claims as validated facts.
5. If information is not available in the provided project context, state: "That information is not available in the provided project."

${projectContext ? `CURRENT PROJECT CONTEXT:\n${JSON.stringify(projectContext, null, 2)}` : ''}`;

    if (!ai) {
      // High quality fallback responses for offline/demo mode
      let fallbackText = `[EXPLANATION]\nI can help answer your laboratory questions about protocol steps, chemical concentrations, buffer preparation, and scientific calculations.\n\n[AI_SUGGESTION]\nFor best results, ensure your reagents and sample details are saved in your MTKmicro project context.`;

      const lowerPrompt = (userQuery || '').toLowerCase();
      if (lowerPrompt.includes('summarize') && projectContext) {
        fallbackText = `[SOURCE_INFO]\nProject "${projectContext.name || 'Current Project'}" contains ${projectContext.steps?.length || 0} protocol steps and ${projectContext.tags?.join(', ') || 'general lab'} tags.\n\n[EXPLANATION]\nThis experiment focuses on ${projectContext.description || 'laboratory procedures'}. Key parameters include step durations and reagent preparations.`;
      } else if (lowerPrompt.includes('material') || lowerPrompt.includes('reagent')) {
        fallbackText = `[SOURCE_INFO]\nExtracted materials from current protocol steps:\n- Master Mix & Primers\n- Nuclease-free Water\n- Template DNA\n\n[AI_SUGGESTION]\nAlways check storage temperatures (-20°C for enzymes, 4°C for buffers) prior to setup.`;
      } else if (lowerPrompt.includes('checklist')) {
        fallbackText = `[AI_SUGGESTION]\nExperimental Checklist:\n1. Verify all reagents are thawed on ice.\n2. Calibrate pipettes and sanitize work bench with 70% ethanol.\n3. Prepare PCR reaction mix in sterile tubes.\n4. Set thermal cycler program and verify lid temperature.`;
      }

      return res.json({
        success: true,
        source: 'local_fallback',
        response: fallbackText,
        reply: fallbackText,
      });
    }

    const historyItems = messages.length > 0 ? messages : conversationHistory;
    const formattedMessages = historyItems.map((msg: any) => ({
      role: (msg.role === 'user' || msg.sender === 'user') ? 'user' : 'model',
      parts: [{ text: msg.content || msg.text || '' }],
    }));

    if (formattedMessages.length === 0 && userQuery) {
      formattedMessages.push({
        role: 'user',
        parts: [{ text: userQuery }],
      });
    }

    const finalContents = [
      { role: 'user', parts: [{ text: `System Directive: ${systemPrompt}` }] },
      ...formattedMessages,
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: finalContents,
    });

    const responseText = response.text || 'No response generated.';

    return res.json({
      success: true,
      source: 'gemini',
      response: responseText,
      reply: responseText,
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'AI Assistant processing failed.',
    });
  }
});

// API Route: Equipment SOP, Calibration & Validity Protocol Generator
app.post('/api/ai/equipment-sop', async (req, res) => {
  try {
    const { equipmentName } = req.body;
    if (!equipmentName) {
      return res.status(400).json({ error: 'equipmentName is required' });
    }

    const ai = getGenAI();
    const prompt = `Generate a comprehensive Standard Operating Procedure (SOP), Calibration Protocol, and Validity Check Method for the following laboratory equipment/instrument: "${equipmentName}".

Return ONLY a valid JSON object matching this exact schema:
{
  "name": "${equipmentName}",
  "category": "e.g. Analytical Measurement | Sterilization | Separation | Optical",
  "isoStandard": "e.g. ISO 17025 / GLP / USP",
  "calibrationFrequency": "e.g. Annually / Bi-annually",
  "validityCheckFrequency": "e.g. Daily / Before Each Shift",
  "ppeRequired": ["Lab coat", "Safety glasses", "Nitrile gloves"],
  "operatingInstructions": {
    "preChecks": ["Pre-operational visual check 1", "Safety check 2"],
    "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
    "postCheckShutdown": ["Shutdown step 1", "Cleaning step 2"],
    "safetyNotes": ["Safety warning 1", "Safety warning 2"]
  },
  "calibrationMethod": {
    "standardsRequired": ["Standard 1", "Standard 2"],
    "environmentalConditions": "Description of environmental temp/humidity requirements",
    "procedure": ["Calibration step 1", "Calibration step 2", "Calibration step 3"],
    "acceptanceCriteria": "Clear acceptance criteria string",
    "toleranceLimits": "Clear tolerance limits string"
  },
  "validityMethod": {
    "dailyCheckProcedure": ["Validity check step 1", "Validity check step 2"],
    "referenceControls": "Description of reference control material used",
    "passFailThresholds": "Pass/fail criteria threshold string",
    "oosActionPlan": ["OOS step 1", "OOS step 2", "OOS step 3"]
  }
}`;

    if (!ai) {
      return res.json({
        name: equipmentName,
        category: 'General Laboratory Instrument',
        isoStandard: 'ISO 17025 / GLP Guidelines',
        calibrationFrequency: 'Annually',
        validityCheckFrequency: 'Daily or Before Use',
        ppeRequired: ['Lab coat', 'Safety glasses', 'Gloves'],
        operatingInstructions: {
          preChecks: [`Perform visual inspection of ${equipmentName}`, 'Check power supply and display status'],
          steps: [`Turn on ${equipmentName}`, 'Prepare and insert samples', 'Run standard protocol', 'Record observed measurements'],
          postCheckShutdown: ['Clean working surfaces with 70% ethanol', 'Turn off instrument or switch to standby'],
          safetyNotes: ['Follow standard laboratory safety procedures']
        },
        calibrationMethod: {
          standardsRequired: ['NIST Traceable Reference Standard'],
          environmentalConditions: 'Ambient temperature 20°C–25°C',
          procedure: ['Zero/blank baseline', 'Measure reference standards in triplicate', 'Record calibration values'],
          acceptanceCriteria: 'Correlation R² ≥ 0.998; Accuracy ±1.0%',
          toleranceLimits: 'Deviation ≤ ±1.0%'
        },
        validityMethod: {
          dailyCheckProcedure: ['Run zero/blank check', 'Measure secondary quality control standard'],
          referenceControls: 'Secondary QC Reference Sample',
          passFailThresholds: 'Control value within ±2 Standard Deviations',
          oosActionPlan: ['Stop testing on failure', 'Clean probe/sensor and repeat check', 'Tag Out Of Service if error persists']
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Equipment SOP Generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate equipment SOP' });
  }
});

// Serve APK file downloads directly
app.get(['/MTKmicroLab.apk', '/app-debug.apk', '/MTKmicroLab-v1.0.0-release.apk', '/api/download-apk', '/api/download/MTKmicroLab.apk'], (req, res) => {
  let apkPath = path.join(process.cwd(), 'MTKmicroLab.apk');
  if (!fs.existsSync(apkPath)) {
    apkPath = path.join(process.cwd(), 'dist', 'MTKmicroLab.apk');
  }
  if (!fs.existsSync(apkPath)) {
    return res.status(404).send('APK file not found. Please trigger a rebuild.');
  }
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="MTKmicroLab.apk"');
  res.sendFile(apkPath);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
