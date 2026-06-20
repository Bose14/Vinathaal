import axios from 'axios';
import { generatePDF } from "./pdfGenerator";
import { api } from "@/lib/apiClient";

export const S3Upload = async (config: any, token: string, templateId: number) => {
  try {
    const paperData = typeof config === "string" ? JSON.parse(config) : config;
    const subjectName = paperData.subjectName;
    const filename = `${subjectName.replace(/\s+/g, '_')}_${token}.pdf`;

    const blob = await generatePDF("question-paper-content", filename);
    const file = new File([blob], filename, { type: blob.type });

    const { uploadURL, objectURL } = await api.storage.getUploadUrl(file.name, file.type);

    await axios.put(uploadURL, blob, { headers: { 'Content-Type': 'application/pdf' } });

    const storedUser = localStorage.getItem("user");
    const email = storedUser ? JSON.parse(storedUser).email : "";

    const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const dateTime = istTime.toISOString().replace('T', ' ').slice(0, 19);

    await api.storage.storeMetadata({ email, uploadURL, objectURL, subjectName, templateId, dateTime });
  } catch (err) {
    console.error('Upload failed:', err);
  }
};
