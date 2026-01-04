import { GoogleGenAI } from "@google/genai";
import { Transaction, Budget } from '../types';

export const getFinancialAdvice = async (
  transactions: Transaction[],
  budgets: Budget[],
  monthSummary: { income: number; expenses: number; balance: number }
) => {
  // Always use the recommended initialization pattern with process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analise a seguinte situação financeira para o mês atual:
    Receitas: R$ ${monthSummary.income}
    Despesas: R$ ${monthSummary.expenses}
    Saldo: R$ ${monthSummary.balance}
    
    Resumo de transações:
    ${transactions.slice(0, 10).map(t => `- ${t.description}: R$ ${t.amount} (${t.type})`).join('\n')}
    
    Por favor, forneça:
    1. Uma avaliação curta da saúde financeira (0-100).
    2. Três dicas práticas e personalizadas para economizar ou investir melhor.
    3. Um comentário encorajador.
    
    Responda em Português do Brasil de forma concisa e amigável.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    // Directly access the .text property from the response as per guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, não consegui gerar seus insights financeiros agora. Tente novamente em breve!";
  }
};