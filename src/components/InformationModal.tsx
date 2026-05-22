import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { alertAPI, type AlertItem, type VictimDetails } from "../lib/api";

interface InformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: AlertItem | null;
  address?: string | null;
}

const InformationModal = ({
  isOpen,
  onClose,
  userData,
  address,
}: InformationModalProps) => {
  const [victimDetails, setVictimDetails] = useState<VictimDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    let cancelled = false;

    const fetchDetails = async (victimId: number) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await alertAPI.getVictimDetails(victimId);
        if (data["address"] !== null && data["address"] !== undefined) {
          data["address"] = data["address"].replaceAll("▞", ", ");
        }
        if (!cancelled) {
          setVictimDetails(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch victim details"
          );
          setVictimDetails(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    if (!isOpen || !userData?.VictimID) {
      setVictimDetails(null);
      setError(null);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    fetchDetails(userData.VictimID);
    return () => {
      cancelled = true;
    };
  }, [isOpen, userData?.VictimID]);

  if (!isOpen) return null;

  const fallbackAddress =
    address ??
    (userData ? `${userData.Latitude}, ${userData.Longitude}` : "N/A");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4">
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto no-scrollbar 
                      rounded-2xl bg-[#E5E5E5] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20"
      >
        {/* Header */}
        <div className="mb-7 flex items-center justify-between border-b border-white pb-4">
          <h2 className="text-xl font-bold text-black uppercase tracking-widest">
            Information Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-sm p-2 hover:bg-gray-100 text-gray-400 hover:text-black"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Left Column: User Information */}
          <section className="rounded-xl bg-white p-6 shadow-inner border border-gray-100">
            <h3 className="mb-6 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
              User Information:
            </h3>
            <table className="w-full text-left text-base border-collapse">
              <tbody className="divide-y divide-gray-200">
                <InfoRow label="Full Name:" value={victimDetails?.fullName} />
                <InfoRow label="Date of Birth:" value={victimDetails?.birthDate} />
                <InfoRow label="Age:" value={victimDetails?.age?.toString()} />
                <InfoRow label="Primary Contact:" value={victimDetails?.primaryContact} />
                <InfoRow label="Address:" value={victimDetails?.address || fallbackAddress} />
                <InfoRow label="Pregnancy Status:" value={victimDetails?.pregnancyStatus} />
                <InfoRow
                  label="Organ Donor:"
                  value={victimDetails?.organDonor}
                />
                {isLoading && (
                  <InfoRow label="Status:" value="Loading details..." />
                )}
              </tbody>
            </table>
          </section>

          {/* Right Column: Medical Information */}
          <section className="rounded-xl bg-white p-6 shadow-inner border border-gray-100">
            <h3 className="mb-6 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
              Medical Information:
            </h3>
            <table className="w-full text-left text-base border-collapse">
              <tbody className="divide-y divide-gray-200">
                <InfoRow label="Last Diagnosis:" value={victimDetails?.lastDiagnosis} />
                <InfoRow label="Diagnosis Date:" value={victimDetails?.diagnosisDate} />
                <InfoRow
                  label="Place of Diagnosis:"
                  value={victimDetails?.placeOfDiagnosis}
                />
                <InfoRow label="Allergies:" value={victimDetails?.allergies} />
                <InfoRow label="Medication:" value={victimDetails?.medication} />
                <InfoRow label="Medical History:" value={victimDetails?.medicalHistory} />
                <InfoRow label="Medical Note:" value={victimDetails?.medicalNote} />
                {isLoading && (
                  <InfoRow label="Status:" value="Loading details..." />
                )}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <tr>
    <td className="py-4 pr-4 font-semibold text-blue-400 w-2/4 align-top">
      {label}
    </td>
    <td className="py-4 text-gray-600 whitespace-pre-line leading-relaxed">
      {value === undefined || value === null || value === "" ? "N/A" : String(value)}
    </td>
  </tr>
);

export default InformationModal;