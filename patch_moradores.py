import re

with open("frontend/app/sindico/(private)/moradores/page.tsx", "r") as f:
    content = f.read()

# Add import XLSX
if "import * as XLSX from \"xlsx\"" not in content:
    content = content.replace('import React, { useState, useEffect } from "react"', 'import React, { useState, useEffect, useRef } from "react"\nimport * as XLSX from "xlsx"')

# Add handleFileUpload method
file_upload_method = """
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

        let parsedText = "";
        // Assume first row might be header, skip if so
        let startIndex = 0;
        if (data.length > 0 && String(data[0][0]).toLowerCase().includes('unidad')) {
            startIndex = 1;
        }

        for (let i = startIndex; i < data.length; i++) {
          const row = data[i];
          if (row.length === 0 || !row[0]) continue;
          
          parsedText += row.join(", ") + "\\n";
        }

        setBulkText(parsedText);
        // We can optionally trigger handleBulkTextChange automatically
        // but it requires a synthetic event or extracting the logic.
        // Let's just process it manually here:
        const lines = parsedText.split("\\n").map(l => l.trim()).filter(l => l.length > 0);
        const parsed: BulkUnitItem[] = lines.map(line => {
          const parts = line.split(",").map(p => p.trim());
          const item: BulkUnitItem = {
            unit: parts[0] || "",
            ownerName: parts[1] || "",
            ownerEmail: parts[2] || "",
            rented: false,
            isValid: false
          };
          if (parts.length >= 5) {
            item.rented = true;
            item.tenantName = parts[3];
            item.tenantEmail = parts[4];
          }
          item.isValid = Boolean(item.unit && item.ownerName && item.ownerEmail && item.ownerEmail.includes("@"));
          if (item.rented) {
            if (!item.tenantName || !item.tenantEmail || !item.tenantEmail.includes("@")) {
              item.isValid = false;
              item.error = "Dados do inquilino incompletos ou email inválido";
            }
          }
          if (!item.isValid && !item.error) {
            item.error = "Unidade, Nome e Email do proprietário (válido) são obrigatórios";
          }
          return item;
        });
        setParsedBulkUnits(parsed);

      } catch (error) {
        toast.error("Erro ao ler arquivo Excel.");
      }
    };
    reader.readAsBinaryString(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
"""

# Inject it after const [isSubmittingBulk, setIsSubmittingBulk] = useState(false)
content = content.replace("const [isSubmittingBulk, setIsSubmittingBulk] = useState(false)", "const [isSubmittingBulk, setIsSubmittingBulk] = useState(false)\n" + file_upload_method)


upload_ui = """
            <div className="space-y-4 py-3">
              <div className="flex items-center gap-4">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Selecionar Planilha (XLS/XLSX)
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xls,.xlsx" 
                  className="hidden" 
                />
              </div>
"""

content = content.replace('<div className="space-y-4 py-3">', upload_ui)

with open("frontend/app/sindico/(private)/moradores/page.tsx", "w") as f:
    f.write(content)
