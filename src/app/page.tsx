"use client";

import { useState, useRef, FormEvent } from "react";
import Image from "next/image";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

interface FormData {
  knowledgeBase: string;
  text: string;
  files: File[];
}

interface KnowledgeBaseOption {
  value: string;
  label: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    knowledgeBase: "",
    text: "",
    files: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const knowledgeBasesOptions = [
    { value: "marketing", label: "Marketing Knowledge Base" },
    { value: "sales", label: "Sales Knowledge Base" },
    { value: "general", label: "Knowledge Base" },
    { value: "amazon", label: "Amazon Knowledge Base" },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.knowledgeBase) {
      setError("Please select a knowledge base");
      return;
    }

    if (!formData.text && formData.files.length === 0) {
      setError("Please provide either text or upload files");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("knowledgeBase", formData.knowledgeBase);
      if (formData.text) submitData.append("text", formData.text);
      formData.files.forEach((file) => submitData.append("files", file));

      // Send data to the specified webhook URL
      const response = await fetch(
        "https://amazon360.app.n8n.cloud/webhook/bcd2a5cd-0e26-487d-9372-0009be630470",
        {
          method: "POST",
          body: submitData,
        }
      );

      if (!response.ok) throw new Error("Failed to submit");

      // Reset form
      setFormData({
        knowledgeBase: "",
        text: "",
        files: [],
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Knowledge Base Upload</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Knowledge Base Selection */}
            <div className="relative">
              <label
                htmlFor="knowledgeBase"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Knowledge Base *
              </label>
              <Dropdown
                id="knowledgeBase"
                value={formData.knowledgeBase}
                onChange={(e: DropdownChangeEvent) =>
                  setFormData({ ...formData, knowledgeBase: e.value })
                }
                options={knowledgeBasesOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Select a knowledge base..."
                className="w-full"
                filter
                showClear
                required
              />
              {!formData.knowledgeBase && (
                <div className="absolute -bottom-5 left-0 text-xs text-indigo-500 font-medium">
                  Please select a knowledge base
                </div>
              )}
            </div>

            {/* Text Input */}
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700"
              >
                Text
              </label>
              <textarea
                id="text"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-all duration-200 ease-in-out text-sm"
                placeholder="Enter your text here..."
              />
            </div>

            {/* File Upload */}
            <div>
              <label
                htmlFor="files"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Files or Images
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-300 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="files"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="files"
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || []);
                          setFormData({
                            ...formData,
                            files: [...formData.files, ...newFiles],
                          });
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        multiple
                        className="sr-only"
                        accept="image/*,.pdf,.doc,.docx,.txt,video/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Images, Videos, PDFs, DOC, DOCX, TXT up to 10MB each
                  </p>
                </div>
              </div>
              {formData.files.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Selected files:
                  </h4>
                  <ul className="mt-1 text-sm text-gray-500">
                    {Array.from(formData.files).map((file, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center py-1"
                      >
                        <span className="truncate">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                          MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = formData.files.filter(
                              (_, i) => i !== index
                            );
                            setFormData({ ...formData, files: newFiles });
                          }}
                          className="ml-2 px-2 text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors duration-200"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
