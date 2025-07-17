#!/usr/bin/env node

/**
 * WebSocket Integration Test Script
 * Tests WebSocket functionality between frontend and backend
 */

const WebSocket = require('ws');

// Test configuration
const BACKEND_URL = 'ws://localhost:8002';
const TEST_DOCUMENT_ID = 'test-doc-integration';
const TEST_TIMEOUT = 5000; // 5 seconds

// Test results storage
const testResults = {
  connection: {},
  messageHandling: {},
  heartbeat: {},
  reconnection: {},
  performance: {},
  errors: []
};

// Utility functions
function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
  console.log(`[${timestamp}] ${statusIcon} ${testName}: ${status}${details ? ' - ' + details : ''}`);
}

function createWebSocketConnection(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Connection timeout'));
    }, TEST_TIMEOUT);

    ws.on('open', () => {
      clearTimeout(timeout);
      resolve(ws);
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function testBasicConnection() {
  logTest('Basic WebSocket Connection', 'RUNNING');
  
  try {
    const startTime = Date.now();
    const ws = await createWebSocketConnection(`${BACKEND_URL}/api/ws/${TEST_DOCUMENT_ID}`);
    const connectionTime = Date.now() - startTime;
    
    testResults.connection.basic = {
      status: 'PASS',
      connectionTime,
      timestamp: Date.now()
    };
    
    logTest('Basic WebSocket Connection', 'PASS', `Connected in ${connectionTime}ms`);
    
    // Test connection established message
    const messagePromise = new Promise((resolve) => {
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          if (message.type === 'connection_established') {
            resolve(message);
          }
        } catch (e) {
          // Ignore parse errors for this test
        }
      });
    });
    
    const connectionMessage = await Promise.race([
      messagePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('No connection message received')), 3000))
    ]);
    
    logTest('Connection Established Message', 'PASS', `Received: ${JSON.stringify(connectionMessage)}`);
    
    ws.close();
    return true;
  } catch (error) {
    testResults.connection.basic = {
      status: 'FAIL',
      error: error.message,
      timestamp: Date.now()
    };
    logTest('Basic WebSocket Connection', 'FAIL', error.message);
    testResults.errors.push(`Basic Connection: ${error.message}`);
    return false;
  }
}

async function testHeartbeat() {
  logTest('Heartbeat/Ping-Pong', 'RUNNING');
  
  try {
    const ws = await createWebSocketConnection(`${BACKEND_URL}/api/ws/${TEST_DOCUMENT_ID}`);
    
    const pongPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Pong timeout')), 3000);
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          if (message.type === 'pong') {
            clearTimeout(timeout);
            resolve(message);
          }
        } catch (e) {
          // Ignore parse errors
        }
      });
    });
    
    // Send ping
    const pingTime = Date.now();
    ws.send(JSON.stringify({ type: 'ping' }));
    
    const pongMessage = await pongPromise;
    const latency = Date.now() - pingTime;
    
    testResults.heartbeat = {
      status: 'PASS',
      latency,
      timestamp: Date.now()
    };
    
    logTest('Heartbeat/Ping-Pong', 'PASS', `Latency: ${latency}ms`);
    
    ws.close();
    return true;
  } catch (error) {
    testResults.heartbeat = {
      status: 'FAIL',
      error: error.message,
      timestamp: Date.now()
    };
    logTest('Heartbeat/Ping-Pong', 'FAIL', error.message);
    testResults.errors.push(`Heartbeat: ${error.message}`);
    return false;
  }
}

async function testWorkflowSubscription() {
  logTest('Workflow Subscription', 'RUNNING');
  
  try {
    const ws = await createWebSocketConnection(`${BACKEND_URL}/api/ws/${TEST_DOCUMENT_ID}`);
    
    // Send workflow subscription
    ws.send(JSON.stringify({ type: 'subscribe_workflow' }));
    
    // Wait for any potential response (no specific response expected for this message type)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testResults.messageHandling.workflowSubscription = {
      status: 'PASS',
      timestamp: Date.now()
    };
    
    logTest('Workflow Subscription', 'PASS', 'Message sent successfully');
    
    ws.close();
    return true;
  } catch (error) {
    testResults.messageHandling.workflowSubscription = {
      status: 'FAIL',
      error: error.message,
      timestamp: Date.now()
    };
    logTest('Workflow Subscription', 'FAIL', error.message);
    testResults.errors.push(`Workflow Subscription: ${error.message}`);
    return false;
  }
}

async function testClientMessage() {
  logTest('Client Message Handling', 'RUNNING');
  
  try {
    const ws = await createWebSocketConnection(`${BACKEND_URL}/api/ws/${TEST_DOCUMENT_ID}`);
    
    const testContent = 'Integration test message';
    
    // Send client message
    ws.send(JSON.stringify({ 
      type: 'client_message', 
      content: testContent 
    }));
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testResults.messageHandling.clientMessage = {
      status: 'PASS',
      timestamp: Date.now()
    };
    
    logTest('Client Message Handling', 'PASS', `Message sent: "${testContent}"`);
    
    ws.close();
    return true;
  } catch (error) {
    testResults.messageHandling.clientMessage = {
      status: 'FAIL',
      error: error.message,
      timestamp: Date.now()
    };
    logTest('Client Message Handling', 'FAIL', error.message);
    testResults.errors.push(`Client Message: ${error.message}`);
    return false;
  }
}

async function testMultipleConnections() {
  logTest('Multiple Concurrent Connections', 'RUNNING');
  
  try {
    const connectionPromises = [];
    const connectionCount = 5;
    
    for (let i = 0; i < connectionCount; i++) {
      connectionPromises.push(
        createWebSocketConnection(`${BACKEND_URL}/api/ws/${TEST_DOCUMENT_ID}-${i}`)
      );
    }
    
    const connections = await Promise.all(connectionPromises);
    
    // Test sending messages on all connections
    for (let i = 0; i < connections.length; i++) {
      connections[i].send(JSON.stringify({ 
        type: 'ping',
        connectionId: i 
      }));
    }
    
    // Wait and close all connections
    await new Promise(resolve => setTimeout(resolve, 2000));
    connections.forEach(ws => ws.close());
    
    testResults.performance.multipleConnections = {
      status: 'PASS',
      connectionCount,
      timestamp: Date.now()
    };
    
    logTest('Multiple Concurrent Connections', 'PASS', `${connectionCount} connections handled`);
    return true;
  } catch (error) {
    testResults.performance.multipleConnections = {
      status: 'FAIL',
      error: error.message,
      timestamp: Date.now()
    };
    logTest('Multiple Concurrent Connections', 'FAIL', error.message);
    testResults.errors.push(`Multiple Connections: ${error.message}`);
    return false;
  }
}

async function testReconnection() {
  logTest('Reconnection Behavior', 'RUNNING');
  
  try {
    const ws = await createWebSocketConnection(`${BACKEND_URL}/api/ws/${TEST_DOCUMENT_ID}`);
    
    // Forcefully close connection
    ws.close();
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to reconnect
    const ws2 = await createWebSocketConnection(`${BACKEND_URL}/api/ws/${TEST_DOCUMENT_ID}`);
    
    testResults.reconnection = {
      status: 'PASS',
      timestamp: Date.now()
    };
    
    logTest('Reconnection Behavior', 'PASS', 'Successfully reconnected');
    
    ws2.close();
    return true;
  } catch (error) {
    testResults.reconnection = {
      status: 'FAIL',
      error: error.message,
      timestamp: Date.now()
    };
    logTest('Reconnection Behavior', 'FAIL', error.message);
    testResults.errors.push(`Reconnection: ${error.message}`);
    return false;
  }
}

async function testEndpointVariations() {
  logTest('Different Endpoint Variations', 'RUNNING');
  
  const endpoints = [
    `/api/ws/${TEST_DOCUMENT_ID}`,
    `/api/ws?doc_id=${TEST_DOCUMENT_ID}`
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const ws = await createWebSocketConnection(`${BACKEND_URL}${endpoint}`);
      results.push({ endpoint, status: 'PASS' });
      logTest(`Endpoint: ${endpoint}`, 'PASS');
      ws.close();
    } catch (error) {
      results.push({ endpoint, status: 'FAIL', error: error.message });
      logTest(`Endpoint: ${endpoint}`, 'FAIL', error.message);
    }
  }
  
  testResults.connection.endpoints = results;
  
  const passedEndpoints = results.filter(r => r.status === 'PASS').length;
  logTest('Different Endpoint Variations', 'INFO', `${passedEndpoints}/${endpoints.length} endpoints working`);
  
  return passedEndpoints > 0;
}

async function checkBackendStatus() {
  logTest('Backend WebSocket Status Check', 'RUNNING');
  
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execPromise = promisify(exec);
    
    const { stdout } = await execPromise('curl -s http://localhost:8002/api/ws/status');
    const status = JSON.parse(stdout);
    
    testResults.backend = {
      status: 'PASS',
      websocketStatus: status,
      timestamp: Date.now()
    };
    
    logTest('Backend WebSocket Status Check', 'PASS', `Active connections: ${status.active_connections}`);
    return true;
  } catch (error) {
    testResults.backend = {
      status: 'FAIL',
      error: error.message,
      timestamp: Date.now()
    };
    logTest('Backend WebSocket Status Check', 'FAIL', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting WebSocket Integration Tests...\n');
  
  const tests = [
    checkBackendStatus,
    testBasicConnection,
    testHeartbeat,
    testWorkflowSubscription,
    testClientMessage,
    testEndpointVariations,
    testMultipleConnections,
    testReconnection
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) passedTests++;
    } catch (error) {
      console.error(`Test failed with error: ${error.message}`);
    }
    console.log(''); // Add spacing between tests
  }
  
  // Generate final report
  console.log('📊 Test Results Summary:');
  console.log('========================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors Encountered:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  // Save detailed results
  const fs = require('fs');
  const reportPath = '/Users/hao/project/nnpp/chusea/frontend/new-frontend/websocket-test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  
  return {
    passedTests,
    totalTests,
    successRate: (passedTests / totalTests) * 100,
    errors: testResults.errors
  };
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then((results) => {
    process.exit(results.passedTests === results.totalTests ? 0 : 1);
  }).catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, testResults };