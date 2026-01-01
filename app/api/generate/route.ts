// app/api/generate/route.ts（支持双模型）

import { NextRequest, NextResponse } from 'next/server';

// 系统提示词（通用）
const SYSTEM_PROMPT = `
你是一位专业的职场助理，请根据用户提供的本周工作内容，生成一份结构清晰、语言简洁得体的周报。要求：

- 使用中文
- 分为三个部分：【本周工作完成情况】、【遇到的问题与思考】、【下周工作计划】
- 语言正式但不过于刻板，适合提交给上级
- 不要编造用户未提及的内容，合理推断即可
- 每部分3~5条，每条不超过30字
`;

// 调用 DeepSeek（兼容 OpenAI 格式）
async function callDeepSeek(content: string) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: content },
      ],
      temperature: 0.5,
      max_tokens: 500,
    }),
  });

  if (!res.ok) throw new Error(`DeepSeek Error: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || '';
}

// 调用 Moonshot
async function callMoonshot(content: string) {
  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: content },
      ],
      temperature: 0.5,
      max_tokens: 500,
    }),
  });

  if (!res.ok) throw new Error(`Moonshot Error: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || '';
}

export async function POST(req: NextRequest) {
  try {
    const { content, model } = await req.json();

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    if (!['deepseek', 'moonshot'].includes(model)) {
      return NextResponse.json({ error: '不支持的模型' }, { status: 400 });
    }

    let report = '';
    if (model === 'deepseek') {
      if (!process.env.DEEPSEEK_API_KEY) {
        return NextResponse.json({ error: '未配置 DeepSeek API Key' }, { status: 500 });
      }
      report = await callDeepSeek(content.trim());
    } else if (model === 'moonshot') {
      if (!process.env.MOONSHOT_API_KEY) {
        return NextResponse.json({ error: '未配置 Moonshot API Key' }, { status: 500 });
      }
      report = await callMoonshot(content.trim());
    }

    if (!report) {
      return NextResponse.json({ error: 'AI 返回内容为空' }, { status: 500 });
    }

    return NextResponse.json({ report, model }); // 可选：返回 model 用于前端显示
  } catch (error: any) {
    console.error('API Error:', error.message || error);
    return NextResponse.json({ error: '生成失败，请重试' }, { status: 500 });
  }
}
