// Test sequences for the Sequencer component
// These represent the LOGIC of sequences, not coordinates

export const testSequences = {
  'problem 1': {
    name: 'problem 1',
    nodes: [
      {
        id: 'start-node',
        type: 'start',
        data: {
          label: 'Start',
          actionType: 'start'
        }
      },
      {
        id: 'node-1',
        type: 'action',
        data: {
          label: 'Send Message',
          actionType: 'send-message',
          config: {}
        }
      },
      {
        id: 'node-2',
        type: 'action',
        data: {
          label: 'Connection Request',
          actionType: 'connection-request',
          config: {}
        }
      },
      {
        id: 'node-3',
        type: 'conditional',
        data: {
          label: 'If/Then',
          actionType: 'if-then',
          config: {}
        }
      },
      {
        id: 'node-4',
        type: 'action',
        data: {
          label: 'Webhook',
          actionType: 'webhook',
          config: {}
        }
      },
      {
        id: 'node-5',
        type: 'action',
        data: {
          label: 'Update Salesforce',
          actionType: 'update-salesforce',
          config: {}
        }
      },
      {
        id: 'node-6',
        type: 'action',
        data: {
          label: 'Connection Request',
          actionType: 'connection-request',
          config: {}
        }
      }
    ],
    edges: [
      {
        id: 'edge-start-1',
        source: 'start-node',
        target: 'node-1',
        sourceHandle: null
      },
      {
        id: 'edge-1-2',
        source: 'node-1',
        target: 'node-2',
        sourceHandle: null
      },
      {
        id: 'edge-2-3',
        source: 'node-2',
        target: 'node-3',
        sourceHandle: null
      },
      {
        id: 'edge-3-4-yes',
        source: 'node-3',
        target: 'node-4',
        sourceHandle: 'yes'
      },
      {
        id: 'edge-4-5',
        source: 'node-4',
        target: 'node-5',
        sourceHandle: null
      },
      {
        id: 'edge-3-6-no',
        source: 'node-3',
        target: 'node-6',
        sourceHandle: 'no'
      }
    ],
    savedAt: new Date().toISOString()
  },
  'problem 2': {
    name: 'problem 2',
    nodes: [
      {
        id: 'start-node',
        type: 'start',
        data: {
          label: 'Start',
          actionType: 'start'
        }
      },
      {
        id: 'node-1',
        type: 'conditional',
        data: {
          label: 'If/Then',
          actionType: 'if-then',
          config: {}
        }
      },
      {
        id: 'node-2',
        type: 'conditional',
        data: {
          label: 'If/Then',
          actionType: 'if-then',
          config: {}
        }
      },
      {
        id: 'node-3',
        type: 'action',
        data: {
          label: 'Send Message',
          actionType: 'send-message',
          config: {}
        }
      },
      {
        id: 'node-4',
        type: 'action',
        data: {
          label: 'Wait',
          actionType: 'wait',
          config: {}
        }
      },
      {
        id: 'node-5',
        type: 'end',
        data: {
          label: 'End Sequence',
          actionType: 'end-sequence',
          config: {}
        }
      }
    ],
    edges: [
      {
        id: 'edge-start-1',
        source: 'start-node',
        target: 'node-1',
        sourceHandle: null
      },
      {
        id: 'edge-1-2-yes',
        source: 'node-1',
        target: 'node-2',
        sourceHandle: 'yes'
      },
      {
        id: 'edge-2-3-yes',
        source: 'node-2',
        target: 'node-3',
        sourceHandle: 'yes'
      },
      {
        id: 'edge-2-4-no',
        source: 'node-2',
        target: 'node-4',
        sourceHandle: 'no'
      },
      {
        id: 'edge-1-5-no',
        source: 'node-1',
        target: 'node-5',
        sourceHandle: 'no'
      }
    ],
    savedAt: new Date().toISOString()
  }
}

// Initialize test data in localStorage if not present
export function initializeTestData () {
  const existing = localStorage.getItem('sequencer-templates')
  if (!existing) {
    const templates = [testSequences['problem 1'], testSequences['problem 2']]
    localStorage.setItem('sequencer-templates', JSON.stringify(templates))
  }
}

