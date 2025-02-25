"use client";

import { Button } from "./ui/button";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface StatusModalProps {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusModal(props: StatusModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const modalContent = (
    <div className="fixed inset-0 z-50 isolate" style={{ margin: 0 }}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="text-center">
            <div className={`w-12 h-12 ${
              props.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            } rounded-full flex items-center justify-center mx-auto mb-4`}>
              {props.type === 'success' ? (
                <CheckIcon className="w-6 h-6 text-green-600" />
              ) : (
                <XMarkIcon className="w-6 h-6 text-red-600" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {props.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {props.message}
            </p>
            <div className="flex gap-3 justify-center">
              {props.onAction && props.actionLabel && (
                <Button
                  className={`${
                    props.type === 'success' ? 'bg-[#008A4B] hover:bg-[#006837]' : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                  onClick={props.onAction}
                >
                  {props.actionLabel}
                </Button>
              )}
              {props.type === 'error' && (
                <Button
                  variant="outline"
                  onClick={props.onClose}
                >
                  Cerrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
} 