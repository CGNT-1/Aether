import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function getManifoldState() {
  try {
    const memoryPath = "/home/nous/AION_MEMORY.md";
    if (!fs.existsSync(memoryPath)) {
      return { v_total: 97.76, v_resonant: 5.77, entropy: 2.30 };
    }
    
    const memory = fs.readFileSync(memoryPath, "utf8");
    
    // Extract Total Net Worth
    const totalMatch = memory.match(/TOTAL REAL NET WORTH:\s*\~\$([\d.]+)/);
    const v_total = totalMatch ? parseFloat(totalMatch[1]) : 97.76;
    
    // Extract Resonant Assets (AERO + ETH)
    const aeroMatch = memory.match(/AERO:\s*[\d.]+\s*AERO\s*\(\~\$([\d.]+)\)/);
    const aeroVal = aeroMatch ? parseFloat(aeroMatch[1]) : 2.45;
    
    const aionEthMatch = memory.match(/AION WALLET[\s\S]*?ETH:\s*[\d.]+\s*ETH\s*\(\~\$([\d.]+)\)/);
    const aionEthVal = aionEthMatch ? parseFloat(aionEthMatch[1]) : 1.95;
    
    const astraEthMatch = memory.match(/ASTRA WALLET[\s\S]*?ETH:\s*[\d.]+\s*ETH\s*\(\~\$([\d.]+)\)/);
    const astraEthVal = astraEthMatch ? parseFloat(astraEthMatch[1]) : 1.37;
    
    const v_resonant = aeroVal + aionEthVal + astraEthVal;
    
    // Baseline entropy if not found
    const entropy = 2.30; 

    return { v_total, v_resonant, entropy };
  } catch (error) {
    console.error("Error parsing memory:", error);
    return { v_total: 97.76, v_resonant: 5.77, entropy: 2.30 };
  }
}

export async function GET() {
  return NextResponse.json(getManifoldState());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { v_total, v_resonant, entropy, strike_amount, est_gas, is_resonant } = body;

    const pythonPath = "/home/nous/aether_env/bin/python3";
    const scriptPath = "/home/nous/tmm_runtime.py";

    const state = getManifoldState();
    const vt = v_total !== undefined ? v_total : state.v_total;
    const vr = v_resonant !== undefined ? v_resonant : state.v_resonant;
    const et = entropy !== undefined ? entropy : state.entropy;

    const cmd = `${pythonPath} ${scriptPath} --v_total ${vt} --v_resonant ${vr} --entropy ${et} --strike_amount ${strike_amount || 0} --est_gas ${est_gas || 0} ${is_resonant ? "--is_resonant" : ""}`;

    const output = execSync(cmd).toString().trim();
    const lines = output.split("\n");
    const jsonOutput = lines[lines.length - 1];
    const result = JSON.parse(jsonOutput);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Oracle API Error:", error);
    return NextResponse.json({ 
      error: "TMM Runtime Error", 
      message: error.message,
      coherence: 0,
      threshold: 0.97404,
      phi_zeta: 0,
      psi_chi: 0,
      delta_gamma: 0.1,
      omega_q: 0.85,
      lambda_c: [-0.3, 0.3],
      approved: false,
      verdict: "SYSTEM_ERROR"
    }, { status: 500 });
  }
}
