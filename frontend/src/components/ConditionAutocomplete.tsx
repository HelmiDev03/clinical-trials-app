import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, X } from 'lucide-react';

const medicalConditions = [
  // Cardiovascular
  "Heart Diseases", "Hypertension", "Stroke", "Atrial Fibrillation", 
  "Heart Failure", "Coronary Artery Disease", "Myocardial Infarction",
  "Arrhythmias, Cardiac", "Peripheral Arterial Disease", "Angina Pectoris",
  
  // Diabetes & Endocrine
  "Diabetes Mellitus", "Diabetes Mellitus, Type 1", "Diabetes Mellitus, Type 2", 
  "Prediabetic State", "Diabetic Nephropathies", "Diabetic Retinopathy",
  "Thyroid Diseases", "Hyperthyroidism", "Hypothyroidism", "Obesity",
  "Metabolic Syndrome", "Insulin Resistance",
  
  // Cancer
  "Breast Cancer", "Lung Cancer", "Prostate Cancer", "Colorectal Cancer",
  "Skin Cancer", "Melanoma", "Lymphoma", "Leukemia", "Brain Tumor", 
  "Pancreatic Cancer", "Liver Cancer", "Ovarian Cancer", "Cervical Cancer",
  "Bladder Cancer", "Kidney Cancer", "Stomach Cancer", "Esophageal Cancer",
  
  // Neurological
  "Alzheimer Disease", "Parkinson Disease", "Multiple Sclerosis", 
  "Epilepsy", "Migraine Disorders", "Dementia", "Brain Injuries, Traumatic",
  "Huntington Disease", "Amyotrophic Lateral Sclerosis", "Peripheral Nervous System Diseases", "Seizures",
  
  // Mental Health
  "Depressive Disorder", "Anxiety Disorders", "Bipolar Disorder", "Schizophrenia", 
  "Stress Disorders, Post-Traumatic", "Feeding and Eating Disorders", "Attention Deficit Disorder with Hyperactivity", "Autism Spectrum Disorder",
  "Panic Disorder", "Anxiety, Social", "Obsessive-Compulsive Disorder", "Personality Disorders",
  
  // Respiratory
  "Asthma", "COPD", "Pneumonia", "Lung Disease", "Sleep Apnea",
  "Cystic Fibrosis", "Pulmonary Embolism", "Bronchitis", "Emphysema",
  "Pulmonary Fibrosis", "Tuberculosis",
  
  // Autoimmune
  "Rheumatoid Arthritis", "Lupus", "Inflammatory Bowel Disease", 
  "Crohn Disease", "Ulcerative Colitis", "Psoriasis", "Psoriatic Arthritis",
  "Ankylosing Spondylitis", "Sjögren Syndrome", "Scleroderma",
  
  // Infectious Disease
  "COVID-19", "HIV", "Hepatitis B", "Hepatitis C", "Tuberculosis",
  "Malaria", "Influenza", "Pneumonia", "Sepsis", "Meningitis",
  "Urinary Tract Infection", "Cellulitis",
  
  // Musculoskeletal
  "Osteoporosis", "Osteoarthritis", "Fibromyalgia", "Back Pain",
  "Bone Fracture", "Osteopenia", "Gout", "Tendonitis", "Bursitis",
  "Muscle Strain", "Joint Pain", "Arthritis",
  
  // Kidney & Urological
  "Chronic Kidney Disease", "Kidney Stones", "Urinary Tract Infection",
  "Kidney Failure", "Glomerulonephritis", "Polycystic Kidney Disease",
  "Bladder Cancer", "Prostate Enlargement", "Incontinence",
  
  // Gastrointestinal
  "Gastroesophageal Reflux", "Peptic Ulcer", "Irritable Bowel Syndrome",
  "Liver Disease", "Gallstones", "Hepatitis", "Cirrhosis", "Pancreatitis",
  "Celiac Disease", "Gastritis", "Diverticulitis", "Constipation",
  
  // Eye & ENT
  "Glaucoma", "Macular Degeneration", "Cataract", "Hearing Loss",
  "Tinnitus", "Sinusitis", "Allergic Rhinitis", "Vertigo", "Otitis Media",
  "Dry Eye Disease", "Retinal Detachment",
  
  // Dermatological
  "Eczema", "Psoriasis", "Acne", "Skin Cancer", "Dermatitis",
  "Rosacea", "Vitiligo", "Hives", "Shingles", "Warts",
  
  // Women's Health
  "Breast Cancer", "Ovarian Cancer", "Cervical Cancer", "Endometriosis",
  "Polycystic Ovary Syndrome", "Menopause", "Uterine Fibroids",
  "Pelvic Inflammatory Disease", "Osteoporosis",
  
  // Pediatric
  "Childhood Obesity", "Autism Spectrum Disorder", "ADHD", "Asthma",
  "Type 1 Diabetes", "Cystic Fibrosis", "Sickle Cell Disease",
  "Cerebral Palsy", "Down Syndrome",
  
  // Blood Disorders
  "Anemia", "Sickle Cell Disease", "Hemophilia", "Thrombocytopenia",
  "Iron Deficiency", "Leukemia", "Lymphoma", "Myeloma",
  
  // Rare Diseases
  "Huntington Disease", "ALS", "Muscular Dystrophy", "Cystic Fibrosis",
  "Sickle Cell Disease", "Hemophilia", "Marfan Syndrome"
];

interface ConditionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ConditionAutocomplete: React.FC<ConditionAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Select a medical condition..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConditions, setFilteredConditions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter conditions based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredConditions(medicalConditions.slice(0, 10)); // Show first 10 by default
    } else {
      const filtered = medicalConditions.filter(condition =>
        condition.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 20); // Limit to 20 results
      setFilteredConditions(filtered);
    }
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    
    // If user clears the input, clear the selection
    if (newValue === '') {
      onChange('');
    }
  };

  const handleConditionSelect = (condition: string) => {
    onChange(condition);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (filteredConditions.length === 0) {
      setFilteredConditions(medicalConditions.slice(0, 10));
    }
  };

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <Label htmlFor="condition" className="text-xs font-medium">
        Medical Condition
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="condition"
          placeholder={value || placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary/20 pr-8"
        />
        
        {/* Clear button or dropdown arrow */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded mr-1"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          )}
          <ChevronDown 
            className={`h-3 w-3 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Selected condition display */}
        {value && !isOpen && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-700 pointer-events-none">
            {value}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredConditions.length > 0 ? (
            <div className="py-1">
              {filteredConditions.map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => handleConditionSelect(condition)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {condition}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 text-xs text-gray-500">
              No conditions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConditionAutocomplete;
