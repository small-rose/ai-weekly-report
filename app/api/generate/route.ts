import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
你是一位专业的职场助理，请根据用户提供的本周工作内容，生成一份结构清晰、语言简洁得体的周报。要求：

- 使用中文
- 分为三个部分：【本周工作完成情况】、【遇到的问题与思考】、【下周工作计划】
- 语言正式但不过于刻板，适合提交给上级
- 不要编造用户未提及的内容，合理推断即可
- 每部分3~5条，每条不超过30字
`;

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 便宜且快
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: content.trim() },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const report = completion.choices[0].message.content?.trim() || '';

    if (!report) {
      return NextResponse.json({ error: 'AI 返回内容为空' }, { status: 500 });
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
