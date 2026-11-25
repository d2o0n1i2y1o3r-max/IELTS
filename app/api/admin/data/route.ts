import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'admin-data.json');
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function getAdminData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { users: [] };
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content || '{"users": []}');
  } catch (err) {
    console.error('Error reading admin data:', err);
    return { users: [] };
  }
}

function getRegisteredUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const content = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(content || '{"users": []}');
    return parsed.users || [];
  } catch (err) {
    console.error('Error reading users.json:', err);
    return [];
  }
}

function saveAdminData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving admin data:', err);
  }
}

export async function GET() {
  try {
    const adminData = getAdminData();
    let users = adminData.users || [];
    const registeredUsers = getRegisteredUsers();

    // 1. Filter out all fake / demo accounts
    users = users.filter((u: any) => {
      if (u.isDemo) return false;
      if (u.plan === 'demo') return false;
      const email = (u.email || '').toLowerCase();
      const name = (u.name || '').toLowerCase();
      if (email.includes('@demo.') || email.includes('guest_')) return false;
      if (name.includes('(demo') || name.startsWith('mehmon')) return false;
      return true;
    });

    // 2. Synchronize any registered users from users.json not yet in admin-data.json
    for (const regUser of registeredUsers) {
      const exists = users.some(
        (u: any) => u.id === regUser.id || (u.email && regUser.email && u.email.toLowerCase() === regUser.email.toLowerCase())
      );
      if (!exists && regUser.email && !regUser.email.includes('@demo.')) {
        users.push({
          id: regUser.id,
          name: regUser.name,
          email: regUser.email,
          isDemo: false,
          plan: 'free',
          activeModel: 'gemini',
          createdAt: regUser.createdAt || new Date().toISOString(),
          writingEssays: [],
          speakingResponses: [],
          chats: [],
        });
      }
    }

    // Save cleaned/synchronized data
    adminData.users = users;
    saveAdminData(adminData);

    // Compute stats ONLY for real users
    const totalUsers = users.length;
    const demoUsers = 0; // Faqat haqiqiy foydalanuvchilar
    const googleUsers = users.length;
    const proMonthlyUsers = users.filter((u: any) => u.plan === 'pro').length;
    const proYearlyUsers = users.filter((u: any) => u.plan === 'pro_yearly').length;
    const proUsers = proMonthlyUsers + proYearlyUsers;
    const plusUsers = users.filter((u: any) => u.plan === 'plus').length;
    const freeUsers = users.filter((u: any) => u.plan === 'free' || (!u.plan)).length;

    const proRevenue = (proMonthlyUsers * 10000) + (proYearlyUsers * 90000);
    const plusRevenue = plusUsers * 20000;
    const totalRevenue = proRevenue + plusRevenue;

    return NextResponse.json({
      stats: {
        totalUsers,
        demoUsers,
        googleUsers,
        freeUsers,
        proUsers,
        plusUsers,
        proRevenue,
        plusRevenue,
        totalRevenue,
      },
      users,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, newPlan } = body;

    const data = getAdminData();
    let users = data.users || [];

    if (action === 'update_plan') {
      users = users.map((u: any) => {
        if (u.id === userId) {
          return { ...u, plan: newPlan, isDemo: newPlan === 'demo' };
        }
        return u;
      });
      data.users = users;
      saveAdminData(data);
      return NextResponse.json({ success: true, users });
    }

    if (action === 'delete') {
      users = users.filter((u: any) => u.id !== userId);
      data.users = users;
      saveAdminData(data);
      return NextResponse.json({ success: true, users });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
