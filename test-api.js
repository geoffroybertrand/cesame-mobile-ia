#!/usr/bin/env node

/**
 * Script de test API - CESAME Mobile
 *
 * Usage:
 *   node test-api.js
 *
 * Ce script teste la connexion à l'API AnythingLLM backend
 * et vérifie que tous les endpoints fonctionnent correctement.
 */

const API_BASE_URL = 'http://192.168.0.43:3001/api';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, emoji, ...args) {
  console.log(`${colors[color]}${emoji}${colors.reset}`, ...args);
}

// Variables globales pour stocker les données
let authToken = null;
let testUser = null;
let workspaceSlug = null;

/**
 * Test 1: Ping du serveur
 */
async function testPing() {
  log('cyan', '🏓', 'Testing server ping...');
  try {
    const response = await fetch(`${API_BASE_URL}/ping`);
    const data = await response.json();

    if (data.online) {
      log('green', '✅', 'Server is online!');
      return true;
    } else {
      log('red', '❌', 'Server returned offline status');
      return false;
    }
  } catch (error) {
    log('red', '❌', 'Ping failed:', error.message);
    return false;
  }
}

/**
 * Test 2: Login / Request Token
 */
async function testLogin(username = 'admin', password = 'password') {
  log('cyan', '🔐', `Testing login with username: ${username}...`);
  try {
    const response = await fetch(`${API_BASE_URL}/request-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.valid && data.token) {
      authToken = data.token;
      testUser = data.user;
      log('green', '✅', 'Login successful!');
      log('blue', '👤', `User: ${data.user.username} (${data.user.role})`);
      log('blue', '🔑', `Token: ${data.token.substring(0, 20)}...`);
      return true;
    } else {
      log('red', '❌', 'Login failed:', data.message);
      return false;
    }
  } catch (error) {
    log('red', '❌', 'Login failed:', error.message);
    return false;
  }
}

/**
 * Test 3: Check Token
 */
async function testCheckToken() {
  if (!authToken) {
    log('yellow', '⚠️', 'No token available, skipping check token test');
    return false;
  }

  log('cyan', '🔍', 'Testing token validation...');
  try {
    const response = await fetch(`${API_BASE_URL}/system/check-token`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (response.ok) {
      log('green', '✅', 'Token is valid!');
      return true;
    } else {
      log('red', '❌', 'Token is invalid:', response.status);
      return false;
    }
  } catch (error) {
    log('red', '❌', 'Check token failed:', error.message);
    return false;
  }
}

/**
 * Test 4: Get Workspaces
 */
async function testGetWorkspaces() {
  if (!authToken) {
    log('yellow', '⚠️', 'No token available, skipping workspaces test');
    return false;
  }

  log('cyan', '📁', 'Testing get workspaces...');
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (data.workspaces && data.workspaces.length > 0) {
      workspaceSlug = data.workspaces[0].slug;
      log('green', '✅', `Found ${data.workspaces.length} workspace(s)!`);
      data.workspaces.forEach((ws, i) => {
        log('blue', '  📂', `${i + 1}. ${ws.name} (${ws.slug})`);
      });
      return true;
    } else {
      log('yellow', '⚠️', 'No workspaces found');
      return false;
    }
  } catch (error) {
    log('red', '❌', 'Get workspaces failed:', error.message);
    return false;
  }
}

/**
 * Test 5: Get Workspace Details
 */
async function testGetWorkspace() {
  if (!authToken || !workspaceSlug) {
    log('yellow', '⚠️', 'No token or workspace available, skipping workspace details test');
    return false;
  }

  log('cyan', '📁', `Testing get workspace details for: ${workspaceSlug}...`);
  try {
    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceSlug}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (data.workspace) {
      log('green', '✅', 'Workspace details retrieved!');
      log('blue', '  📝', `Name: ${data.workspace.name}`);
      log('blue', '  🔗', `Slug: ${data.workspace.slug}`);
      log('blue', '  📅', `Created: ${data.workspace.createdAt}`);
      return true;
    } else {
      log('red', '❌', 'No workspace data returned');
      return false;
    }
  } catch (error) {
    log('red', '❌', 'Get workspace failed:', error.message);
    return false;
  }
}

/**
 * Test 6: Get Chat History
 */
async function testGetChatHistory() {
  if (!authToken || !workspaceSlug) {
    log('yellow', '⚠️', 'No token or workspace available, skipping chat history test');
    return false;
  }

  log('cyan', '💬', `Testing get chat history for: ${workspaceSlug}...`);
  try {
    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceSlug}/chats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (data.history) {
      log('green', '✅', `Chat history retrieved: ${data.history.length} messages`);
      if (data.history.length > 0) {
        const lastChat = data.history[data.history.length - 1];
        log('blue', '  💭', `Last message: "${lastChat.prompt.substring(0, 50)}..."`);
      }
      return true;
    } else {
      log('yellow', '⚠️', 'No chat history available');
      return false;
    }
  } catch (error) {
    log('red', '❌', 'Get chat history failed:', error.message);
    return false;
  }
}

/**
 * Test 7: Get Suggested Messages
 */
async function testGetSuggestedMessages() {
  if (!authToken || !workspaceSlug) {
    log('yellow', '⚠️', 'No token or workspace available, skipping suggested messages test');
    return false;
  }

  log('cyan', '💡', `Testing get suggested messages for: ${workspaceSlug}...`);
  try {
    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceSlug}/suggested-messages`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (data.suggestedMessages) {
      log('green', '✅', `Suggested messages retrieved: ${data.suggestedMessages.length}`);
      data.suggestedMessages.forEach((msg, i) => {
        log('blue', '  💡', `${i + 1}. ${msg.heading}`);
      });
      return true;
    } else {
      log('yellow', '⚠️', 'No suggested messages available');
      return false;
    }
  } catch (error) {
    log('red', '❌', 'Get suggested messages failed:', error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n');
  log('cyan', '🚀', '='.repeat(60));
  log('cyan', '🚀', 'CESAME Mobile - API Test Suite');
  log('cyan', '🚀', '='.repeat(60));
  console.log('\n');

  log('blue', 'ℹ️', `API Base URL: ${API_BASE_URL}`);
  console.log('\n');

  const results = [];

  // Test 1: Ping
  results.push(await testPing());
  console.log('\n');

  // Test 2: Login
  const loginSuccess = await testLogin();
  results.push(loginSuccess);
  console.log('\n');

  if (!loginSuccess) {
    log('red', '❌', 'Login failed, cannot continue with authenticated tests');
    log('yellow', '💡', 'Please check your credentials or backend status');
    printSummary(results);
    return;
  }

  // Test 3: Check Token
  results.push(await testCheckToken());
  console.log('\n');

  // Test 4: Get Workspaces
  const workspacesSuccess = await testGetWorkspaces();
  results.push(workspacesSuccess);
  console.log('\n');

  if (!workspacesSuccess) {
    log('yellow', '⚠️', 'No workspaces found, skipping workspace-specific tests');
    printSummary(results);
    return;
  }

  // Test 5: Get Workspace Details
  results.push(await testGetWorkspace());
  console.log('\n');

  // Test 6: Get Chat History
  results.push(await testGetChatHistory());
  console.log('\n');

  // Test 7: Get Suggested Messages
  results.push(await testGetSuggestedMessages());
  console.log('\n');

  // Print summary
  printSummary(results);
}

/**
 * Print test summary
 */
function printSummary(results) {
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  const failed = total - passed;

  log('cyan', '📊', '='.repeat(60));
  log('cyan', '📊', 'Test Summary');
  log('cyan', '📊', '='.repeat(60));
  console.log('\n');

  log('blue', 'ℹ️', `Total tests: ${total}`);
  log('green', '✅', `Passed: ${passed}`);

  if (failed > 0) {
    log('red', '❌', `Failed: ${failed}`);
  }

  console.log('\n');

  if (passed === total) {
    log('green', '🎉', 'All tests passed! API is working correctly.');
  } else {
    log('yellow', '⚠️', 'Some tests failed. Check the logs above for details.');
  }

  console.log('\n');
}

// Run tests
runTests().catch(error => {
  log('red', '💥', 'Fatal error:', error);
  process.exit(1);
});
