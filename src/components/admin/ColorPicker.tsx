import React from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

type ColorInfo = {
    model: 'hsla' | 'rgba';
    values: [number, number, number, number];
    hex: string;
};

// Helper to parse any color string into a structured object
const parseColor = (color: string): ColorInfo => {
    try {
        if (color.startsWith('hsl')) { // handles hsl and hsla
            const parts = color.match(/[\d.]+/g)!.map(Number);
            const [h, s, l, a = 1] = parts;
            
            // HSL to HEX conversion for the <input type="color">
            const s_norm = s / 100;
            const l_norm = l / 100;
            const c = (1 - Math.abs(2 * l_norm - 1)) * s_norm;
            const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
            const m = l_norm - c / 2;
            let r = 0, g = 0, b = 0;
            if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
            else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
            else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
            else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
            else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
            else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
            const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
            const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
            const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

            return { model: 'hsla', values: [h, s, l, a], hex: `#${rHex}${gHex}${bHex}` };
        }

        if (color.startsWith('rgb') || color.startsWith('#')) { // handles rgb, rgba, and hex
            let r = 0, g = 0, b = 0, a = 1;
            let hex = '#ffffff';

            if (color.startsWith('#')) {
                hex = color;
                r = parseInt(hex.slice(1, 3), 16);
                g = parseInt(hex.slice(3, 5), 16);
                b = parseInt(hex.slice(5, 7), 16);
            } else { // rgb or rgba
                const parts = color.match(/[\d.]+/g)!.map(Number);
                [r, g, b, a = 1] = parts;
                const rHex = r.toString(16).padStart(2, '0');
                const gHex = g.toString(16).padStart(2, '0');
                const bHex = b.toString(16).padStart(2, '0');
                hex = `#${rHex}${gHex}${bHex}`;
            }
            return { model: 'rgba', values: [r, g, b, a], hex };
        }
    } catch (e) { /* Fallback */ }

    // Default fallback
    return { model: 'rgba', values: [255, 255, 255, 1], hex: '#ffffff' };
};

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const { model, values, hex } = parseColor(value || 'hsla(0, 0%, 100%, 1)');
  const alpha = values[3];

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    const r = parseInt(newHex.slice(1, 3), 16);
    const g = parseInt(newHex.slice(3, 5), 16);
    const b = parseInt(newHex.slice(5, 7), 16);

    if (model === 'hsla') {
        // Convert RGB back to HSL to preserve the model
        const r_norm = r / 255;
        const g_norm = g / 255;
        const b_norm = b / 255;
        const max = Math.max(r_norm, g_norm, b_norm);
        const min = Math.min(r_norm, g_norm, b_norm);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r_norm: h = (g_norm - b_norm) / d + (g_norm < b_norm ? 6 : 0); break;
                case g_norm: h = (b_norm - r_norm) / d + 2; break;
                case b_norm: h = (r_norm - g_norm) / d + 4; break;
            }
            h /= 6;
        }
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        onChange(`hsla(${h}, ${s}%, ${l}%, ${alpha.toFixed(2)})`);
    } else {
        onChange(`rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`);
    }
  };

  const handleAlphaChange = (newAlphaValue: number[]) => {
    const newAlpha = newAlphaValue[0];
    if (model === 'hsla') {
        const [h, s, l] = values;
        onChange(`hsla(${h}, ${s}%, ${l}%, ${newAlpha.toFixed(2)})`);
    } else {
        const [r, g, b] = values;
        onChange(`rgba(${r}, ${g}, ${b}, ${newAlpha.toFixed(2)})`);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input type="color" value={hex} onChange={handleHexChange} className="p-1 h-10" />
        <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: value }}></div>
      </div>
      <div>
        <Label className="text-xs">Transparencia</Label>
        <Slider value={[alpha]} onValueChange={handleAlphaChange} max={1} step={0.01} />
      </div>
    </div>
  );
};