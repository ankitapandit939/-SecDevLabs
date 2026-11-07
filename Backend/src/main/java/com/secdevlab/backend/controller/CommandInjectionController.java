package com.secdevlab.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/command")
@CrossOrigin(origins = "*")
public class CommandInjectionController {

    // Whitelist regex allowing only valid domain names or IPv4 addresses
    private static final Pattern HOSTNAME_OR_IP_PATTERN =
            Pattern.compile("^[a-zA-Z0-9.-]+$");

    /**
     * VULNERABLE: Direct concatenation of user input into a shell command interpreter (cmd.exe / sh).
     * Windows payload: 127.0.0.1 && whoami
     * Linux payload:   127.0.0.1; whoami
     */
    @GetMapping("/vulnerable/ping")
    public ResponseEntity<Map<String, Object>> vulnerablePing(@RequestParam String host) {
        Map<String, Object> response = new HashMap<>();
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");

        // Vulnerable: user input is fed into the shell interpreter
        String[] command;
        if (isWindows) {
            command = new String[]{"cmd.exe", "/c", "ping -n 2 " + host};
        } else {
            command = new String[]{"sh", "-c", "ping -c 2 " + host};
        }

        try {
            Process process = Runtime.getRuntime().exec(command);
            String output = readProcessOutput(process);
            int exitCode = process.waitFor();

            response.put("status", "SUCCESS");
            response.put("executedCommand", String.join(" ", command));
            response.put("exitCode", exitCode);
            response.put("output", output);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * SECURE:
     * 1. Whitelist validation (rejects special characters like &, |, ;, `, $, <, >)
     * 2. ProcessBuilder without a shell interpreter (arguments are passed as separate array tokens)
     */
    @GetMapping("/secure/ping")
    public ResponseEntity<Map<String, Object>> securePing(@RequestParam String host) {
        Map<String, Object> response = new HashMap<>();

        // Defense 1: Strict input whitelist validation
        if (host == null || !HOSTNAME_OR_IP_PATTERN.matcher(host.trim()).matches()) {
            response.put("status", "REJECTED");
            response.put("error", "Invalid hostname or IP address format.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");

        // Defense 2: Avoid shell interpreter (no cmd.exe / sh -c). Arguments are isolated tokens.
        List<String> commandList = isWindows
                ? List.of("ping", "-n", "2", host.trim())
                : List.of("ping", "-c", "2", host.trim());

        try {
            ProcessBuilder processBuilder = new ProcessBuilder(commandList);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            String output = readProcessOutput(process);
            int exitCode = process.waitFor();

            response.put("status", "SUCCESS");
            response.put("executedCommand", String.join(" ", commandList));
            response.put("exitCode", exitCode);
            response.put("output", output);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private String readProcessOutput(Process process) throws Exception {
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        return output.toString();
    }
}