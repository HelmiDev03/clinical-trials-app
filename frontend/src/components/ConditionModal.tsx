import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';

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

interface ConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (conditions: string[]) => void;
  currentConditions?: string[];
}

const ConditionModal: React.FC<ConditionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentConditions = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConditions, setFilteredConditions] = useState(medicalConditions);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(currentConditions);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredConditions(medicalConditions);
    } else {
      const filtered = medicalConditions.filter(condition =>
        condition.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConditions(filtered);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedConditions(currentConditions);
    }
  }, [isOpen, currentConditions]);

  const handleToggleCondition = (condition: string) => {
    setSelectedConditions(prev => {
      if (prev.includes(condition)) {
        return prev.filter(c => c !== condition);
      } else {
        return [...prev, condition];
      }
    });
  };

  const handleApply = () => {
    onSelect(selectedConditions);
    onClose();
  };

  const handleClear = () => {
    setSelectedConditions([]);
  };

  const handleClearAll = () => {
    onSelect([]);
    onClose();
  };

  const removeCondition = (conditionToRemove: string) => {
    setSelectedConditions(prev => prev.filter(c => c !== conditionToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Select Medical Conditions ({selectedConditions.length} selected)
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Selected Conditions */}
          {selectedConditions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Selected Conditions:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-3 bg-muted/30 rounded-lg">
                {selectedConditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                  >
                    <span>{condition}</span>
                    <button
                      onClick={() => removeCondition(condition)}
                      className="hover:bg-primary/20 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditions List */}
          <ScrollArea className="h-80 border rounded-lg">
            <div className="p-4 space-y-2">
              {filteredConditions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No conditions found for "{searchTerm}"
                </div>
              ) : (
                filteredConditions.map((condition, index) => {
                  const isSelected = selectedConditions.includes(condition);
                  return (
                    <button
                      key={index}
                      onClick={() => handleToggleCondition(condition)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-primary/5 hover:border-primary/20 ${
                        isSelected 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{condition}</span>
                        {isSelected && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleClearAll}>
              Clear All & Close
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleApply}>
                Apply ({selectedConditions.length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConditionModal;
