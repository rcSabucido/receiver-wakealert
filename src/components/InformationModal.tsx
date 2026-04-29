import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface InformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: any; // The alert object passed from AlertsPage
}

type InformationItem = {
  id: number;
  dateOfBirth: string;
  age: number; 
  primaryContact: string;
  address: string;
  pregnancyStatus: string;
  organDonor: boolean; 
  lastDiagnosis: string;
  diagnosisDate: string;
  placeOfDiagnosis: string;
  allergies: string;
  medication: string;
  medicalHistory: string;
  medicalNote: string;
};

const info: InformationItem[] = [
  {
    id: 1,
    dateOfBirth: "1995/08/24",
    age: 30,
    primaryContact: "09xxxxxxxxxxx ( Family )",
    address: "Blk 2, Lot 34, Barangay Sto. Nino, Something City, Batangas",
    pregnancyStatus: "N/A",
    organDonor: true, 
    lastDiagnosis: "Hypertension, High Blood Pressure, Osteoporosis, Arthritis, Asthma",
    diagnosisDate: "2026/01/15",
    placeOfDiagnosis: "Batangas Medical Center",
    allergies: "Shrimp, Peanuts, Shrimp, Rice, Dust, Pollen",
    medication: "Amlodipine,Insulin, Morphine,Vicodin, Percocet,Penicillin, Sulfa Drugs",
    medicalHistory: "Asthma,Hypertension,High Blood Pressure,Osteoporosis, Arthritis",
    medicalNote: "Patient needs regular BP monitoring and \n dietary modifications also.........."
  },
  {
    id: 2,
    dateOfBirth: "1988/03/12",
    age: 36,
    primaryContact: "09xxxxxxxxxx ( Friend )",
    address: "123 Main St, Barangay San Roque, Something City, Batangas",
    pregnancyStatus: "Pregnant (2 months)",
    organDonor: false, 
    lastDiagnosis: "Diabetes Mellitus Type 2",
    diagnosisDate: "2025/11/20",
    placeOfDiagnosis: "San Roque Hospital",
    allergies: "None",
    medication: "Metformin, Morphine, Vicodin, Percocet, Penicillin",
    medicalHistory: "None",
    medicalNote: "Patient should maintain a healthy diet and \n exercise regularly also......"
  },
  {
    id: 3,
    dateOfBirth: "1990/05/10",
    age: 33,
    primaryContact: "09xxxxxxxxx ( Sister )",
    address: "456 Another St, Barangay San Roque, Something City, Batangas",
    pregnancyStatus: "N/A",
    organDonor: true, 
    lastDiagnosis: "Chronic Kidney Disease",
    diagnosisDate: "2025/09/05",
    placeOfDiagnosis: "San Roque Hospital",
    allergies: "Penicillin, Dust, Pollen, Peanuts",
    medication: "Lisinopril, Morphine, Vicodin, Percocet, Penicillin, Sulfa Drugs, Insulin",
    medicalHistory: "Hypertension, Diabetes (Type 2), Asthma,Hypertension, High Blood Pressure, Osteoporosis, Arthritis",
    medicalNote: "Patient requires regular kidney function tests and dietary modifications \n also........"
  },
  {
    id: 4,
    dateOfBirth: "1992/11/30",
    age: 31,
    primaryContact: "09xxxxxxxxx ( Brother )",
    address: "789 Different St, Barangay Sto. Nino, Something City, Batangas",
    pregnancyStatus: "N/A",
    organDonor: false,
    lastDiagnosis: "Depression",
    diagnosisDate: "2026/03/10",
    placeOfDiagnosis: "Batangas Medical Center",
    allergies: "None",
    medication: "Fluoxetine, Sertraline",
    medicalHistory: "Anxiety, Depression",
    medicalNote: "Patient needs regular mental health check-ups and therapy sessions."
  },
  {
    id: 5,
    dateOfBirth: "1985/07/20",
    age: 38,
    primaryContact: "09xxxxxxxxx ( Parent )",
    address: "321 Last St, Barangay San Roque, Something City, Batangas",
    pregnancyStatus: "N/A",
    organDonor: true,
    lastDiagnosis: "Coronary Artery Disease",
    diagnosisDate: "2025/12/01",
    placeOfDiagnosis: "San Roque Hospital",
    allergies: "Shellfish, Dust, Pollen",
    medication: "Aspirin, Atorvastatin, Morphine, Vicodin, Percocet, Penicillin",
    medicalHistory: "Hypertension, High Blood Pressure, Diabetes (Type 2),Asthma",
    medicalNote: "Patient should maintain a heart-healthy diet and exercise regularly."
  }
];


const InformationModal = ({ isOpen, onClose, userData }: InformationModalProps) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const patientDetails = info.find((item) => item.id === userData?.id);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto no-scrollbar 
                      rounded-2xl bg-[#E5E5E5] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between border-b border-white pb-4">
          <h2 className="text-xl font-bold text-black uppercase tracking-widest">
            Information Details
          </h2>
          <button onClick={onClose} className="rounded-sm p-2 hover:bg-gray-100 text-gray-400 hover:text-black">
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          
          {/* Left Column: User Information */}
          <section className="rounded-xl bg-white p-6 shadow-inner border border-gray-100">
            <h3 className="mb-6 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">User Information:</h3>
            <table className="w-full text-left text-base border-collapse">
              <tbody className="divide-y divide-gray-200">
                <InfoRow label="Full Name:" value={`${userData?.firstName} ${userData?.lastName}`} />
                <InfoRow label="Date of Birth:" value={patientDetails?.dateOfBirth} />
                <InfoRow label="Age:" value={patientDetails?.age?.toString()} />
                <InfoRow label="Primary Contact:" value={patientDetails?.primaryContact} />
                <InfoRow label="Address:" value={patientDetails?.address} />
                <InfoRow label="Pregnancy Status:" value={patientDetails?.pregnancyStatus} />
                
                <InfoRow label="Organ Donor:" value={patientDetails?.organDonor ? "Yes" : "No"} />
              </tbody>
            </table>
          </section>

          {/* Right Column: Medical Information */}
          <section className="rounded-xl bg-white p-6 shadow-inner border border-gray-100">
            <h3 className="mb-6 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">Medical Information:</h3>
            <table className="w-full text-left text-base border-collapse">
              <tbody className="divide-y divide-gray-200">
                <InfoRow label="Last Diagnosis:" value={patientDetails?.lastDiagnosis} />
                <InfoRow label="Diagnosis Date:" value={patientDetails?.diagnosisDate} />
                <InfoRow label="Place of Diagnosis:" value={patientDetails?.placeOfDiagnosis} />
                <InfoRow label="Allergies:" value={patientDetails?.allergies} />
                <InfoRow label="Medication:" value={patientDetails?.medication} />
                <InfoRow label="Medical History:" value={patientDetails?.medicalHistory} />
                <InfoRow label="Medical Note:" value={patientDetails?.medicalNote} />
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <tr>
    <td className="py-4 pr-4 font-semibold text-blue-400 w-2/4 align-top">{label}</td>
    <td className="py-4 text-gray-600 whitespace-pre-line leading-relaxed">{value || "N/A"}</td>
  </tr>
);

export default InformationModal;