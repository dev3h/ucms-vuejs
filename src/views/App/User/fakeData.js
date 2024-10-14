export const treeData = [
  {
    id: 1,
    name: 'System A',
    code: 'systemA',
    type: 'system',
    children: [
      {
        id: 11,
        name: 'Subsystem A1',
        code: 'subsystemA1',
        type: 'subsystem',
        children: [
          {
            id: 111,
            name: 'Module M1',
            code: 'moduleM1',
            type: 'module',
            permissions: [
              {
                id: 1111,
                name: 'Action 1',
                code: 'systemA-subsystemA1-moduleM1-action1',
                type: 'action',
                granted: true
              },
              {
                id: 1112,
                name: 'Action 2',
                code: 'systemA-subsystemA1-moduleM1-action2',
                type: 'action',
                granted: false
              }
            ]
          },
          {
            id: 112,
            name: 'Module M2',
            code: 'moduleM2',
            type: 'module',
            permissions: [
              {
                id: 1121,
                name: 'Action 3',
                code: 'systemA-subsystemA1-moduleM2-action3',
                type: 'action',
                granted: false
              }
            ]
          }
        ]
      },
      {
        id: 12,
        name: 'Subsystem A2',
        code: 'subsystemA2',
        type: 'subsystem',
        children: [
          {
            id: 121,
            name: 'Module M3',
            code: 'moduleM3',
            type: 'module',
            permissions: [
              {
                id: 1211,
                name: 'Action 4',
                code: 'systemA-subsystemA2-moduleM3-action4',
                type: 'action',
                granted: false
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'System B',
    code: 'systemB',
    type: 'system',
    children: [
      {
        id: 21,
        name: 'Subsystem B1',
        code: 'subsystemB1',
        type: 'subsystem',
        children: [
          {
            id: 211,
            name: 'Module M4',
            code: 'moduleM4',
            type: 'module',
            permissions: [
              {
                id: 2111,
                name: 'Action 5',
                code: 'systemB-subsystemB1-moduleM4-action5',
                type: 'action',
                granted: false
              }
            ]
          },
          {
            id: 212,
            name: 'Module M5',
            code: 'moduleM5',
            type: 'module',
            permissions: [
              {
                id: 2121,
                name: 'Action 6',
                code: 'systemB-subsystemB1-moduleM5-action6',
                type: 'action',
                granted: true
              }
            ]
          }
        ]
      }
    ]
  }
];