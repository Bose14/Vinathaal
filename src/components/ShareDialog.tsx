import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share, Mail, MessageCircle, Upload, FileDown, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface ShareDialogProps {
  title: string;
  content: string;
  pdfBlob?: Blob; // ✅ new prop for PDF
}

const ShareDialog = ({ title, content, pdfBlob }: ShareDialogProps) => {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [open, setOpen] = useState(false);

  // ✅ custom popup state
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  // ✅ loading state for email sending
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const senderEmail = user?.email;
  const userName = user?.name;

  const showPopup = (message: string) => {
    setPopupMessage(message);
    setOpen(false);
    setTimeout(() => setPopupMessage(null), 2000); // hide after 2s
  };

  const shareToEmail = async () => {
    if (!receiverEmail.trim()) {
      showPopup("❌ Please enter an email address");
      return;
    }

    if (!pdfBlob) {
      showPopup("⚠️ PDF not available");
      return;
    }

    try {
      setLoading(true); // 🔹 start loader

      const formData = new FormData();
      formData.append("receiverEmail", receiverEmail);
      formData.append("senderEmail", senderEmail);
      formData.append("title", title);
      formData.append("file", pdfBlob, title);
      formData.append("userName", userName);

      const res = await fetch(`${API_BASE}/send-email`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setOpen(false);
        setReceiverEmail("");
        showPopup("✅ Email sent successfully! to\n" + receiverEmail);
      } else {
        showPopup(`❌ Failed: ${data.message}`);
        setReceiverEmail("");
      }
    } catch (error) {
      console.error(error);
      showPopup("⚠️ Error while sending email");
    } finally {
      setLoading(false); // 🔹 stop loader
    }
  };

  const shareToGoogleDrive = () => {
    alert("📂 Google Drive integration coming soon!");
    // console.log("Would share to Google Drive:", { title, content });
  };

  const sharePdf = async () => {
    if (!pdfBlob) {
      showPopup("⚠️ PDF not ready yet");
      return;
    }

    const file = new File([pdfBlob], `${title}.pdf`, { type: "application/pdf" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title,
          text: "Here is the generated question paper",
          files: [file],
        });
        // showPopup("✅ Shared successfully!");
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // fallback download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      showPopup("⬇️ File downloaded (sharing not supported)");
    }
  };

  return (
    <>
      {popupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          {/* 🔹 Background overlay with blur */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setPopupMessage(null)} // click outside to close
          />

          {/* 🔹 Popup Card */}
          <div
            className="relative bg-white rounded-xl shadow-xl border border-gray-200
                 p-6 w-[340px] text-center animate-fade-in-out"
          >
            <p className="text-gray-600 font-bold">{popupMessage}</p>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Question Paper</DialogTitle>
            {/* <DialogDescription>
              Choose how you want to share or download your generated PDF.
            </DialogDescription> */}
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={sharePdf}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </Button>
              <Button
                onClick={shareToGoogleDrive}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Google Drive</span>
              </Button>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                />
                <Button onClick={shareToEmail} size="sm" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Share/Download PDF */}
            <Button onClick={sharePdf} className="w-full">
              <FileDown className="w-4 h-4 mr-2" />
              Share / Copy PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareDialog;
