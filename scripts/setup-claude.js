#!/usr/bin/env node
import { homedir } from 'os';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';

const CLAUDE_CONFIG_DIR = join(homedir(), 'Library', 'Application Support', 'Claude');
const CLAUDE_CONFIG_FILE = join(CLAUDE_CONFIG_DIR, 'claude_desktop_config.json');

async function setupClaudeConfig() {
  try {
    // Get current working directory for the MCP server path
    const currentDir = process.cwd();
    const serverPath = join(currentDir, 'build', 'index.js');

    // Create config directory if it doesn't exist
    await mkdir(CLAUDE_CONFIG_DIR, { recursive: true });

    // Read existing config or create new one
    let config = { mcpServers: {} };
    try {
      const existingConfig = await readFile(CLAUDE_CONFIG_FILE, 'utf8');
      config = JSON.parse(existingConfig);
    } catch (error) {
      // File doesn't exist or is invalid JSON, use default config
    }

    // Add our server configuration
    config.mcpServers = {
      ...config.mcpServers,
      dexscreener: {
        command: 'node',
        args: [serverPath],
        env: {
          NODE_OPTIONS: '--experimental-vm-modules'
        },
        restart: true
      }
    };

    // Write updated config
    await writeFile(CLAUDE_CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('✅ DexScreener MCP server successfully configured in Claude Desktop');
    console.log('🚀 Restart Claude Desktop to activate the server');

  } catch (error) {
    console.error('❌ Error setting up Claude Desktop configuration:', error);
    process.exit(1);
  }
}

setupClaudeConfig();
