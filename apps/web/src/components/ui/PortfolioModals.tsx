"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { useApiClient } from "@/lib/apiClient";
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from "./icons";

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  currencyCode: string;
  createdAt: string;
}

interface CreatePortfolioForm {
  name: string;
  description: string;
  currencyCode: string;
}

interface EditPortfolioForm extends CreatePortfolioForm {
  id: string;
}

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type CreatePortfolioModalProps = PortfolioModalProps;

interface EditPortfolioModalProps extends PortfolioModalProps {
  portfolio: Portfolio | null;
}

interface FeedbackState {
  type: "success" | "error" | null;
  message: string;
}

// Create Portfolio Modal
export const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { apiClient } = useApiClient();
  const [form, setForm] = useState<CreatePortfolioForm>({
    name: "",
    description: "",
    currencyCode: "USD",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: null,
    message: "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setForm({ name: "", description: "", currencyCode: "USD" });
      setFeedback({ type: null, message: "" });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: null, message: "" });

    try {
      await apiClient.createPortfolio({
        name: form.name.trim(),
        description: form.description.trim(),
        currencyCode: form.currencyCode,
      });

      setFeedback({
        type: "success",
        message: "Portfolio created successfully!",
      });

      // Close modal and refresh data after a brief delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error creating portfolio:", error);
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create portfolio. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-portfolio-title"
      aria-describedby="create-portfolio-description"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold text-gray-900"
            id="create-portfolio-title"
          >
            Create New Portfolio
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Feedback Messages */}
        {feedback.type && (
          <div
            className={`mb-4 p-3 rounded-md flex items-center ${
              feedback.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${
                feedback.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {feedback.message}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio Name *
            </label>
            <input
              type="text"
              id="create-portfolio-name"
              required
              maxLength={50}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="My Investment Portfolio"
              disabled={isSubmitting}
              aria-describedby="create-portfolio-name-help"
            />
            <div className="text-xs text-gray-500 mt-1">
              {form.name.length}/50 characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              maxLength={200}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              rows={3}
              placeholder="Portfolio description..."
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 mt-1">
              {form.description.length}/200 characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency *
            </label>
            <select
              value={form.currencyCode}
              onChange={(e) =>
                setForm({ ...form, currencyCode: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={isSubmitting}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.name.trim()}
              variant="primary"
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Portfolio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Portfolio Modal
export const EditPortfolioModal: React.FC<EditPortfolioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  portfolio,
}) => {
  const { apiClient } = useApiClient();
  const [form, setForm] = useState<EditPortfolioForm>({
    id: "",
    name: "",
    description: "",
    currencyCode: "USD",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: null,
    message: "",
  });

  // Update form when portfolio changes
  useEffect(() => {
    if (isOpen && portfolio) {
      setForm({
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description || "",
        currencyCode: portfolio.currencyCode,
      });
      setFeedback({ type: null, message: "" });
    }
  }, [isOpen, portfolio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio) return;

    setIsSubmitting(true);
    setFeedback({ type: null, message: "" });

    try {
      await apiClient.updatePortfolio(form.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        currencyCode: form.currencyCode,
      });

      setFeedback({
        type: "success",
        message: "Portfolio updated successfully!",
      });

      // Close modal and refresh data after a brief delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update portfolio. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !portfolio) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit Portfolio
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Feedback Messages */}
        {feedback.type && (
          <div
            className={`mb-4 p-3 rounded-md flex items-center ${
              feedback.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${
                feedback.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {feedback.message}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio Name *
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 mt-1">
              {form.name.length}/50 characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              maxLength={200}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              rows={3}
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 mt-1">
              {form.description.length}/200 characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency *
            </label>
            <select
              value={form.currencyCode}
              onChange={(e) =>
                setForm({ ...form, currencyCode: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={isSubmitting}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.name.trim()}
              variant="primary"
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
