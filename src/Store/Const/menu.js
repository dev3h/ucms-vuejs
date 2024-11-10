export const MASTER_MENUS = [
    {
        label: 'sidebar.dashboard',
        icon: "dashboard-icon.svg",
        route: "admin.dashboard.index",
        pathActive: "dashboard",
    },
    {
        label: 'sidebar.system-components',
        icon: "system-icon.svg",
        route: '',
        pathActive: 'system-components',
        subMenus: [
            {
                label: 'sidebar.system',
                icon: "system-icon.svg",
                route: "system",
                pathActive: "/admin/system-components/system",
            },
            {
                label: 'sidebar.subsystem',
                icon: "subsystem-icon.svg",
                route: "subsystem",
                pathActive: "/admin/system-components/subsystem",
            },
            {
                label: 'sidebar.module',
                icon: "module-icon.svg",
                route: "module",
                pathActive: "/admin/system-components/module",
            },
            {
                label: 'sidebar.action',
                icon: "action-icon.svg",
                route: "action",
                pathActive: "/admin/system-components/action",
            },
        ]
    },
    {
        label: 'sidebar.user-management',
        icon: "user-icon.svg",
        route: '',
        pathActive: 'user-management',
        subMenus: [
            {
                label: 'sidebar.user',
                icon: "user-icon.svg",
                route: "user",
                pathActive: "/admin/user-management/user",
            },
            {
                label: 'sidebar.role',
                icon: "role-icon.svg",
                route: "role",
                pathActive: "/admin/user-management/role",
            },
            {
                label: 'sidebar.permission',
                icon: "permission-icon.svg",
                route: "permission",
                pathActive: "/admin/user-management/permission",
            }
        ]
    },
    {
        label: 'sidebar.audit-log',
        icon: "audit-log-icon.svg",
        route: "audit-log",
        pathActive: "audit-log",
    },
    // {
    //     label: 'sidebar.notification',
    //     icon: 'bell-icon.svg',
    //     route: 'admin.notification.index',
    //     pathActive: 'notification',
    // }
];
