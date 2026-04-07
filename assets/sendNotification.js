// sendNotification.js - bunu projenize ekleyin
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';

// EmailJS'i başlatın (kendi bilgilerinizle değiştirin)
emailjs.init("YOUR_PUBLIC_KEY");

export async function sendEmailNotification(taskData, actionType) {
  try {
    const templateParams = {
      to_email: "ipapila@gmail.com",
      from_name: "ALBATUR-Papila İş Takip",
      action_type: actionType,
      task_title: taskData.title || "İş adı yok",
      task_description: taskData.description || "Açıklama yok",
      task_status: taskData.status || "Bilinmiyor",
      task_priority: taskData.priority || "Normal",
      created_date: new Date().toLocaleString('tr-TR'),
      task_details: JSON.stringify(taskData, null, 2)
    };

    const response = await emailjs.send(
      "YOUR_SERVICE_ID",    // EmailJS'den alacağınız Service ID
      "YOUR_TEMPLATE_ID",   // EmailJS'den alacağınız Template ID
      templateParams
    );
    
    console.log("✅ Bildirim gönderildi:", response);
    return true;
  } catch (error) {
    console.error("❌ Bildirim hatası:", error);
    return false;
  }
}
