import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import axios from "axios";
import { toast } from "sonner";
import { PlusCircleIcon } from "lucide-react";
import { useContentStore } from "../store/useContentStore";
import { useUserStore } from "../store/useUserStore";

type NoteFormData = {
  noteTitle: string;
  noteContent: string;
};

type DocumentFormData = {
  document: FileList;
};

type LinkFormData = {
  url: string;
};

const UploadDialog: React.FC<{
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}> = ({ dialogOpen, setDialogOpen }) => {
  const {
    register: registerNote,
    handleSubmit: handleNoteSubmit,
    reset: resetNoteForm,
  } = useForm<NoteFormData>();

  const {
    register: registerDocument,
    handleSubmit: handleDocumentSubmit,
    reset: resetDocumentForm,
  } = useForm<DocumentFormData>();

  const {
    register: registerLink,
    handleSubmit: handleLinkSubmit,
    reset: resetLinkForm,
  } = useForm<LinkFormData>();

  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);

  const onNoteSubmit = async (data: NoteFormData) => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/notes`,
        {
          title: data.noteTitle,
          content: data.noteContent,
          userId: user?.id,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success("Note uploaded successfully!");
      useContentStore.getState().triggerUpdate();
      resetNoteForm();
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload note");
    } finally {
      setLoading(false);
    }
  };

  const onDocumentSubmit = async (data: DocumentFormData) => {
    setLoading(true);
    try {
      const file = data.document[0];

      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed!");
        setLoading(false);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB!");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user?.id || "");

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/documents`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.success("Document uploaded successfully!");
      useContentStore.getState().triggerUpdate();
      resetDocumentForm();
      setDialogOpen(false);
    } catch (error: any) {
      console.log(error.response.data.error);
      toast.error(error.response?.data?.error || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  const onLinkSubmit = async (data: LinkFormData) => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/link`,
        { url: data.url, userId: user?.id },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success("Link saved successfully!");
      useContentStore.getState().triggerUpdate();
      resetLinkForm();
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button className="h-12 max-sm:w-12 md:py-2 md:px-4 flex justify-center items-center border rounded-2xl border-blue-800/25 bg-white hover:shadow-md transition-shadow duration-300">
          <span className="flex gap-2">
            <PlusCircleIcon className="h-6 w-6 text-blue-700" />
            <h1 className="max-sm:hidden">Add Ideas</h1>
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white shadow-lg rounded-lg p-6">
        <DialogTitle className="text-2xl font-bold mb-4 text-blue-950">
          Add Idea
        </DialogTitle>
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="documents">Document</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <form
              onSubmit={handleNoteSubmit(onNoteSubmit)}
              className="space-y-4"
            >
              <Label>Note Title</Label>
              <Input {...registerNote("noteTitle", { required: true })} />
              <Label>Note Content</Label>
              <Textarea {...registerNote("noteContent", { required: true })} />
              <Button
                type="submit"
                className="w-full bg-blue-950 text-white"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Note"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="documents">
            <form
              onSubmit={handleDocumentSubmit(onDocumentSubmit)}
              className="space-y-4"
            >
              <Label>Document File (PDF only, Max 10MB)</Label>
              <Input
                type="file"
                accept="application/pdf"
                {...registerDocument("document", { required: true })}
              />
              <Button
                type="submit"
                className="w-full bg-blue-950 text-white"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Document"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="links">
            <form
              onSubmit={handleLinkSubmit(onLinkSubmit)}
              className="space-y-4"
            >
              <Label>Enter URL</Label>
              <Input
                type="url"
                {...registerLink("url", { required: true })}
              />
              <Button
                type="submit"
                className="w-full bg-blue-950 text-white"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Link"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <DialogClose asChild>
          <Button variant="outline" className="w-full bg-black text-white">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
