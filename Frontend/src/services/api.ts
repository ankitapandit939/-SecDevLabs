import type { Lab } from '../data/labsData';

const BACKEND_BASE = "http://localhost:8080";

export interface ExecutionResult {
  success: boolean;
  status: number;
  data: any;
  isSimulated: boolean;
  error?: string;
}

export async function executePayload(lab: Lab, payloadValue: string): Promise<ExecutionResult> {
  try {
    let url = `${BACKEND_BASE}${lab.apiEndpoint}`;
    const options: RequestInit = {
      method: lab.httpMethod,
      headers: { "Content-Type": "application/json" }
    };

    if (lab.httpMethod === "GET") {
      if (lab.isPathVar) {
        url = `${url}/${encodeURIComponent(payloadValue)}`;
      } else {
        url = `${url}?${encodeURIComponent(lab.paramName)}=${encodeURIComponent(payloadValue)}`;
      }
    } else {
      if (lab.id === "xss") {
        options.body = JSON.stringify({
          author: "StudentAttacker",
          content: payloadValue
        });
      } else {
        url = `${url}?${encodeURIComponent(lab.paramName)}=${encodeURIComponent(payloadValue)}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    options.signal = controller.signal;

    const res = await fetch(url, options);
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      success: res.ok,
      status: res.status,
      data: data,
      isSimulated: false
    };
  } catch (err: any) {
    // If backend is offline or connection refused, fallback gracefully to realistic simulation
    return generateSimulationOutput(lab, payloadValue);
  }
}

function generateSimulationOutput(lab: Lab, payload: string): ExecutionResult {
  if (lab.id === "sqli") {
    return {
      success: true,
      status: 200,
      isSimulated: true,
      data: [
        { id: 1, username: "alice", role: "USER", password: "password123" },
        { id: 2, username: "bob", role: "USER", password: "secret456" },
        { id: 3, username: "admin", role: "ADMIN", password: "SuperAdminSecret!2026" }
      ]
    };
  } else if (lab.id === "cmdi") {
    return {
      success: true,
      status: 200,
      isSimulated: true,
      data: {
        status: "SUCCESS",
        executedCommand: "cmd.exe /c ping -n 2 " + payload,
        output: "Pinging 127.0.0.1 with 32 bytes of data:\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\n\n[INJECTED PROCESS OUTPUT]:\nDESKTOP-SECDEV\\secadmin"
      }
    };
  } else if (lab.id === "idor") {
    return {
      success: true,
      status: 200,
      isSimulated: true,
      data: {
        id: Number(payload) || 3,
        email: "admin@secdevlab.com",
        creditCardNumber: "3782-8224-6310-005",
        userId: Number(payload) || 3,
        warning: "🚨 IDOR Leak: Unauthenticated access to sensitive profile record!"
      }
    };
  } else if (lab.id === "xss") {
    return {
      success: true,
      status: 200,
      isSimulated: true,
      data: {
        id: 104,
        author: "StudentAttacker",
        content: payload,
        warning: "🚨 Stored in DB: Injected script stored without HTML escaping. Executes in browser DOM!"
      }
    };
  } else {
    return {
      success: true,
      status: 200,
      isSimulated: true,
      data: {
        status: "SUCCESS",
        message: `Email updated to '${payload}' without Anti-CSRF token verification!`,
        vulnerability: "Ambient session cookie accepted for state-changing cross-origin request."
      }
    };
  }
}
