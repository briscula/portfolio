"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus management and escape key handling
  useEffect(() => {
    if (isOpen) {
      // Focus first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      // Handle escape key
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && !isSubmitting) {
          onClose();
        }
      };

      // Trap focus within modal
      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );

          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[
              focusableElements.length - 1
            ] as HTMLElement;

            if (event.shiftKey) {
              if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
              }
            }
          }
        }
      };

      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleTabKey);

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("keydown", handleTabKey);
      };
    }
  }, [isOpen, isSubmitting, onClose]);

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
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
        role="document"
      >
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
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            role="alert"
            aria-live="polite"
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

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          id="create-portfolio-description"
        >
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="create-portfolio-name"
            >
              Portfolio Name *
            </label>
            <input
              ref={firstInputRef}
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
              aria-invalid={form.name.length > 50 ? "true" : "false"}
            />
            <div
              className="text-xs text-gray-500 mt-1"
              id="create-portfolio-name-help"
              aria-live="polite"
            >
              {form.name.length}/50 characters
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="create-portfolio-description"
            >
              Description
            </label>
            <textarea
              id="create-portfolio-description"
              maxLength={200}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              rows={3}
              placeholder="Portfolio description..."
              disabled={isSubmitting}
              aria-describedby="create-portfolio-description-help"
              aria-invalid={form.description.length > 200 ? "true" : "false"}
            />
            <div
              className="text-xs text-gray-500 mt-1"
              id="create-portfolio-description-help"
              aria-live="polite"
            >
              {form.description.length}/200 characters
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="create-portfolio-currency"
            >
              Currency *
            </label>
            <select
              id="create-portfolio-currency"
              value={form.currencyCode}
              onChange={(e) =>
                setForm({ ...form, currencyCode: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={isSubmitting}
              aria-describedby="create-portfolio-currency-help"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
            <div
              className="text-xs text-gray-500 mt-1"
              id="create-portfolio-currency-help"
            >
              Select the primary currency for this portfolio
            </div>
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
              aria-describedby={
                isSubmitting ? "create-portfolio-submitting" : undefined
              }
            >
              {isSubmitting ? "Creating..." : "Create Portfolio"}
            </Button>
            {isSubmitting && (
              <span
                id="create-portfolio-submitting"
                className="sr-only"
                aria-live="polite"
              >
                Creating portfolio, please wait...
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Portfolio Modal with similar accessibility enhancements
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
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus management and escape key handling
  useEffect(() => {
    if (isOpen) {
      // Focus first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      // Handle escape key and focus trapping (same as create modal)
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && !isSubmitting) {
          onClose();
        }
      };

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );

          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[
              focusableElements.length - 1
            ] as HTMLElement;

            if (event.shiftKey) {
              if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
              }
            }
          }
        }
      };

      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleTabKey);

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("keydown", handleTabKey);
      };
    }
  }, [isOpen, isSubmitting, onClose]);

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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-portfolio-title"
      aria-describedby="edit-portfolio-description"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
        role="document"
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold text-gray-900"
            id="edit-portfolio-title"
          >
            Edit Portfolio
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            role="alert"
            aria-live="polite"
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

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          id="edit-portfolio-description"
        >
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="edit-portfolio-name"
            >
              Portfolio Name *
            </label>
            <input
              ref={firstInputRef}
              type="text"
              id="edit-portfolio-name"
              required
              maxLength={50}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={isSubmitting}
              aria-describedby="edit-portfolio-name-help"
              aria-invalid={form.name.length > 50 ? "true" : "false"}
            />
            <div
              className="text-xs text-gray-500 mt-1"
              id="edit-portfolio-name-help"
              aria-live="polite"
            >
              {form.name.length}/50 characters
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="edit-portfolio-description"
            >
              Description
            </label>
            <textarea
              id="edit-portfolio-description"
              maxLength={200}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              rows={3}
              disabled={isSubmitting}
              aria-describedby="edit-portfolio-description-help"
              aria-invalid={form.description.length > 200 ? "true" : "false"}
            />
            <div
              className="text-xs text-gray-500 mt-1"
              id="edit-portfolio-description-help"
              aria-live="polite"
            >
              {form.description.length}/200 characters
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="edit-portfolio-currency"
            >
              Currency *
            </label>
            <select
              id="edit-portfolio-currency"
              value={form.currencyCode}
              onChange={(e) =>
                setForm({ ...form, currencyCode: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={isSubmitting}
              aria-describedby="edit-portfolio-currency-help"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
            <div
              className="text-xs text-gray-500 mt-1"
              id="edit-portfolio-currency-help"
            >
              Select the primary currency for this portfolio
            </div>
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
              aria-describedby={
                isSubmitting ? "edit-portfolio-submitting" : undefined
              }
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            {isSubmitting && (
              <span
                id="edit-portfolio-submitting"
                className="sr-only"
                aria-live="polite"
              >
                Saving portfolio changes, please wait...
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
