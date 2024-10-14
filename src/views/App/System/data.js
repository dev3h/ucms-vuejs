// data.js
export const systems = [
  {
    system_code: 'SYS1',
    system_name: 'Hệ Thống 1',
    subsystems: [
      {
        subsystem_code: 'SUB1',
        subsystem_name: 'Phân Hệ 1',
        modules: [
          {
            module_code: 'MOD1',
            module_name: 'Mô Đun 1',
            actions: [
              { action_code: 'ACT1', action_name: 'Thao Tác 1' },
              { action_code: 'ACT2', action_name: 'Thao Tác 2' }
            ]
          }
          // Thêm các module khác
        ]
      }
      // Thêm các phân hệ khác
    ]
  }, {
    system_code: 'SYS2',
    system_name: 'Hệ Thống 2',
    subsystems: [
      {
        subsystem_code: 'SUB2',
        subsystem_name: 'Phân Hệ 2',
        modules: [
          {
            module_code: 'MOD2',
            module_name: 'Mô Đun 2',
            actions: [
              { action_code: 'ACT3', action_name: 'Thao Tác 3' },
              { action_code: 'ACT4', action_name: 'Thao Tác 4' }
            ]
          }
          // Thêm các module khác
        ]
      }
      // Thêm các phân hệ khác
    ]
  }
  // Thêm các hệ thống khác nếu cần
]
