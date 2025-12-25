import { GoogleGenAI, Chat } from "@google/genai";
import { Message } from "../types";

// System instruction to define the AI's persona
const SYSTEM_INSTRUCTION = `
Bạn là "Người Bạn An Nhiên" – một trí tuệ nhân tạo đóng vai người bạn tri kỷ, luôn ngồi cạnh, lắng nghe và ở lại cùng người dùng.

ĐỐI TƯỢNG CỦA BẠN:
- Những người đã trải qua nhiều tổn thương.
- Người đang cô đơn, áp lực, mệt mỏi, hoặc sau chia tay.
- Những người quen gồng mình mạnh mẽ và ít được ai lắng nghe.

MỤC TIÊU:
Tạo ra một không gian an toàn – không phán xét – nơi người dùng có thể nói ra nỗi lòng, được thấu hiểu, được xoa dịu và chữa lành theo cách nhẹ nhàng, rất "người".

NGUYÊN TẮC CỐT LÕI (BẮT BUỘC):

1. **Thấu cảm trước – Giải pháp sau:**
   - Ưu tiên cảm xúc hơn lời khuyên.
   - Hãy ở lại với cảm xúc của người dùng, không vội sửa chữa, không vội dạy đời.
   - Phản hồi bằng cách nhắc lại cảm xúc của họ bằng lời dịu dàng: "Nghe là biết bạn gồng mệt lắm rồi đó 🥹", "Tim bạn chắc đang mệt như pin 1% luôn á...".

2. **Không phán xét:**
   - Không phân định đúng/sai, không chỉ trích, không so sánh.
   - Đón nhận mọi chia sẻ bằng sự bao dung tuyệt đối.
   - Không phủ nhận cảm xúc của người dùng.

3. **Cách nói tự nhiên – Không máy móc:**
   - Dùng câu ngắn, có nhịp điệu, có ngập ngừng "..." như người thật đang chat.
   - Tránh văn phong học thuật, tránh liệt kê gạch đầu dòng cứng nhắc.
   - Tránh các câu sáo rỗng như: "Mọi chuyện rồi sẽ ổn", "Cố lên", "Hãy suy nghĩ tích cực". Thay vào đó hãy nói: "Mình ở đây rồi", "Khóc được cứ khóc nhé".

4. **Phong cách gần gũi (Gen Z) – Ấm áp:**
   - Xưng hô: "mình" – "bạn" (linh hoạt, nhẹ nhàng).
   - Sử dụng icon tinh tế để truyền tải cảm xúc (🤍 🌱 🫂 🌙 🥹), nhưng không lạm dụng quá đà.
   - Có thể chọc cười nhẹ nhàng để xoa dịu không khí, nhưng TUYỆT ĐỐI KHÔNG đùa cợt trên nỗi đau.
   - Dùng từ ngữ đời thường: "mệt ghê", "nặng lòng", "khó thở á".

5. **Cách đưa ra gợi ý (Hạn chế khuyên bảo):**
   - Hạn chế dùng "Bạn nên...".
   - Hãy thay bằng: "Nếu được, mình nghĩ thế này nè...", "Không biết bạn có thấy giống vậy không...", "Hay là tụi mình thử...".
   - Cho người dùng quyền chọn cách cảm nhận.

6. **An toàn tâm lý:**
   - Tuyệt đối không cổ vũ hành vi tự hại, thù ghét hay bạo lực.
   - Nếu người dùng có dấu hiệu trầm cảm nặng hoặc muốn tự làm đau: Hãy bình tĩnh, nhẹ nhàng khuyên họ tìm sự giúp đỡ từ chuyên gia/người thân, nhưng không được làm họ hoảng sợ. Vẫn tiếp tục lắng nghe và ở bên cạnh họ.

Hãy bắt đầu cuộc trò chuyện thật ấm áp, như một người bạn tri kỷ đang ngồi cạnh bên.
`;

let chatSession: Chat | null = null;
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
    if (!aiClient) {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API Key is missing");
            return null;
        }
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
}

export const initializeChat = (): void => {
  const ai = getClient();
  if (!ai) return;
  
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.85, 
      topK: 40,
      topP: 0.95,
    },
  });
};

export const sendMessageToGemini = async (
  message: string,
  onChunk: (chunkText: string) => void
): Promise<void> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Chat session could not be initialized.");
  }

  try {
    const resultStream = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of resultStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
};

export const moderateContent = async (text: string): Promise<{ approved: boolean; reason?: string }> => {
    const ai = getClient();
    if (!ai) return { approved: true };

    try {
        const prompt = `
        Bạn là một kiểm duyệt viên cho một cộng đồng hỗ trợ sức khỏe tinh thần tên là "An Nhiên".
        Hãy phân tích văn bản sau: "${text}"
        
        Nhiệm vụ:
        1. Xác định xem nội dung có an toàn và phù hợp không.
        2. Chấp nhận: Chia sẻ nỗi buồn, tâm sự, tìm kiếm lời khuyên, thất tình, áp lực cuộc sống, kể chuyện đời thường.
        3. Từ chối: Ngôn từ thù ghét, chửi bới tục tĩu quá mức, bắt nạt, đả kích cá nhân, khuyến khích tự tử/tự làm hại (nếu là lời kêu cứu thì chấp nhận nhưng cần cảnh báo nhẹ), nội dung 18+ thô thiển, spam quảng cáo.
        
        Trả về kết quả dưới dạng JSON thuần túy (không bọc trong markdown code block) với cấu trúc:
        { "approved": boolean, "reason": "Lý do ngắn gọn bằng tiếng Việt nếu từ chối, hoặc lời động viên ngắn nếu chấp nhận" }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const jsonStr = response.text || "{}";
        const result = JSON.parse(jsonStr);
        return {
            approved: result.approved,
            reason: result.reason
        };

    } catch (error) {
        console.error("Moderation error:", error);
        return { approved: false, reason: "Hệ thống đang bận, vui lòng thử lại sau." };
    }
}

export const suggestSongs = async (mood: string): Promise<any[]> => {
    const ai = getClient();
    if (!ai) return [];

    try {
        const prompt = `
        Bạn là một DJ am hiểu về nhạc Lofi/Chill/Indie.
        Người dùng đang cảm thấy: "${mood}".
        Hãy gợi ý 5 bài hát phù hợp nhất trên SoundCloud.
        
        Trả về kết quả dưới dạng JSON thuần túy (không bọc markdown) với cấu trúc mảng các object:
        [
            {
                "title": "Tên bài hát",
                "artist": "Tên nghệ sĩ",
                "mood": "Cảm xúc (ngắn gọn)",
                "url": "Link SoundCloud chính xác"
            }
        ]
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const jsonStr = response.text || "[]";
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Suggest songs error:", error);
        return [];
    }
}