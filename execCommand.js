import { execSync } from "node:child_process"

export function execCommand(command) {
    try {
        const output = execSync(command, { stdio: "inherit" });
        return output;
    } catch (error) {
        console.error(`Command failed: ${error.message}`);
    }
}
