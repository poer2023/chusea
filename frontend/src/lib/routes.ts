export interface Route {
  path: string;
  name: string;
  title: string;
  description?: string;
  icon?: string;
  protected?: boolean;
  public?: boolean;
  category?: string;
  order?: number;
  children?: Route[];
}

export interface RouteGuard {
  path: string;
  requiresAuth?: boolean;
  requiredRoles?: string[];
  redirect?: string;
}

export interface MenuConfig {
  main: Route[];
  tools: Route[];
  user: Route[];
}

// 路由定义
export const routes: Route[] = [
  {
    path: '/',
    name: 'home',
    title: '首页',
    description: '主页和功能导航',
    icon: '🏠',
    public: true,
    category: 'main',
    order: 1,
  },
  {
    path: '/documents',
    name: 'documents',
    title: '文档管理',
    description: '创建、编辑和管理文档',
    icon: '📄',
    category: 'main',
    order: 2,
    children: [
      {
        path: '/documents/new',
        name: 'documents-new',
        title: '新建文档',
        description: '创建新的文档',
        icon: '📝',
        category: 'action',
      },
      {
        path: '/documents/recent',
        name: 'documents-recent',
        title: '最近文档',
        description: '查看最近编辑的文档',
        icon: '🕐',
        category: 'filter',
      },
      {
        path: '/documents/starred',
        name: 'documents-starred',
        title: '收藏文档',
        description: '查看收藏的文档',
        icon: '⭐',
        category: 'filter',
      },
    ],
  },
  {
    path: '/literature',
    name: 'literature',
    title: '文献研究',
    description: '搜索和管理学术文献',
    icon: '📚',
    category: 'main',
    order: 3,
  },
  {
    path: '/tools',
    name: 'tools',
    title: '写作工具',
    description: 'AI辅助写作工具和实用程序',
    icon: '🛠️',
    category: 'main',
    order: 4,
    children: [
      {
        path: '/tools/ai-assistant',
        name: 'tools-ai',
        title: 'AI写作助手',
        description: 'AI辅助写作和内容生成',
        icon: '🤖',
        category: 'tool',
      },
      {
        path: '/tools/grammar-check',
        name: 'tools-grammar',
        title: '语法检查',
        description: '检查文档语法和拼写',
        icon: '✅',
        category: 'tool',
      },
      {
        path: '/tools/readability',
        name: 'tools-readability',
        title: '可读性分析',
        description: '分析文档的可读性评分',
        icon: '📊',
        category: 'tool',
      },
    ],
  },
  {
    path: '/auth',
    name: 'auth',
    title: '用户认证',
    description: '登录和注册管理',
    icon: '👤',
    category: 'user',
    order: 5,
    children: [
      {
        path: '/auth/login',
        name: 'auth-login',
        title: '登录',
        description: '用户登录',
        icon: '🔑',
        public: true,
        category: 'auth',
      },
      {
        path: '/auth/register',
        name: 'auth-register',
        title: '注册',
        description: '用户注册',
        icon: '📝',
        public: true,
        category: 'auth',
      },
    ],
  },
  {
    path: '/settings',
    name: 'settings',
    title: '设置',
    description: '应用设置和个人偏好',
    icon: '⚙️',
    protected: true,
    category: 'user',
    order: 6,
  },
];

// 路由守卫配置
export const routeGuards: RouteGuard[] = [
  {
    path: '/documents',
    requiresAuth: true,
    redirect: '/auth/login',
  },
  {
    path: '/documents/*',
    requiresAuth: true,
    redirect: '/auth/login',
  },
  {
    path: '/literature',
    requiresAuth: true,
    redirect: '/auth/login',
  },
  {
    path: '/tools',
    requiresAuth: true,
    redirect: '/auth/login',
  },
  {
    path: '/settings',
    requiresAuth: true,
    redirect: '/auth/login',
  },
];

// 菜单配置
export const menuConfig: MenuConfig = {
  main: routes.filter(route => route.category === 'main'),
  tools: routes.find(route => route.name === 'tools')?.children || [],
  user: routes.filter(route => route.category === 'user'),
};

// 实用函数
export function getRouteByPath(path: string): Route | undefined {
  const findRoute = (routes: Route[], targetPath: string): Route | undefined => {
    for (const route of routes) {
      if (route.path === targetPath) {
        return route;
      }
      if (route.children) {
        const found = findRoute(route.children, targetPath);
        if (found) return found;
      }
    }
    return undefined;
  };

  return findRoute(routes, path);
}

export function getRouteByName(name: string): Route | undefined {
  const findRoute = (routes: Route[], targetName: string): Route | undefined => {
    for (const route of routes) {
      if (route.name === targetName) {
        return route;
      }
      if (route.children) {
        const found = findRoute(route.children, targetName);
        if (found) return found;
      }
    }
    return undefined;
  };

  return findRoute(routes, name);
}

export function getAllRoutes(): Route[] {
  const flattenRoutes = (routes: Route[]): Route[] => {
    const result: Route[] = [];
    for (const route of routes) {
      result.push(route);
      if (route.children) {
        result.push(...flattenRoutes(route.children));
      }
    }
    return result;
  };

  return flattenRoutes(routes);
}

export function getPublicRoutes(): Route[] {
  return getAllRoutes().filter(route => route.public);
}

export function getProtectedRoutes(): Route[] {
  return getAllRoutes().filter(route => route.protected);
}

export function isPublicRoute(path: string): boolean {
  const route = getRouteByPath(path);
  return route?.public === true;
}

export function isProtectedRoute(path: string): boolean {
  const route = getRouteByPath(path);
  return route?.protected === true;
}

export function requiresAuth(path: string): boolean {
  // 检查具体路由是否需要认证
  const route = getRouteByPath(path);
  if (route?.protected) return true;
  if (route?.public) return false;

  // 检查路由守卫
  const guard = routeGuards.find(guard => {
    if (guard.path.endsWith('/*')) {
      const basePath = guard.path.slice(0, -2);
      return path.startsWith(basePath);
    }
    return guard.path === path;
  });

  return guard?.requiresAuth === true;
}

export function getRedirectPath(path: string): string | null {
  const guard = routeGuards.find(guard => {
    if (guard.path.endsWith('/*')) {
      const basePath = guard.path.slice(0, -2);
      return path.startsWith(basePath);
    }
    return guard.path === path;
  });

  return guard?.redirect || null;
}

// 面包屑导航生成
export function generateBreadcrumbs(path: string): Route[] {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: Route[] = [];

  // 总是添加首页
  const homeRoute = getRouteByPath('/');
  if (homeRoute) {
    breadcrumbs.push(homeRoute);
  }

  // 构建路径并查找对应的路由
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const route = getRouteByPath(currentPath);
    if (route) {
      breadcrumbs.push(route);
    }
  }

  return breadcrumbs;
}

// 导出默认路由配置
export default {
  routes,
  routeGuards,
  menuConfig,
  getRouteByPath,
  getRouteByName,
  getAllRoutes,
  getPublicRoutes,
  getProtectedRoutes,
  isPublicRoute,
  isProtectedRoute,
  requiresAuth,
  getRedirectPath,
  generateBreadcrumbs,
};