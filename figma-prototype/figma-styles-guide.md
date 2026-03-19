# 🎨 Figma CSS Styles Guide
## จองนัดหมาย - Calendar App

### 📱 **Layout & Container**
```css
/* Main Container */
.container {
    max-width: 800px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

/* Content Padding */
.content {
    padding: 32px;
}
```

### 🎯 **Colors Palette**
```css
/* Primary Colors */
--primary-blue: #4285f4;
--primary-blue-hover: #3367d6;
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Status Colors */
--green: #4caf50;
--purple: #9c27b0;
--blue: #2196f3;
--gray: #f5f5f5;

/* Text Colors */
--text-primary: #333;
--text-secondary: #666;
--text-light: #999;

/* Border Colors */
--border-light: #e0e0e0;
--border-focus: #4285f4;
```

### 📋 **Typography**
```css
/* Headers */
h1 {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
}

h3 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #333;
}

/* Body Text */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Small Text */
.small-text {
    font-size: 14px;
    color: #666;
}
```

### 🔘 **Buttons**
```css
/* Primary Button */
.btn-primary {
    padding: 12px 24px;
    border-radius: 8px;
    background: #4285f4;
    color: white;
    font-size: 16px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary:hover {
    background: #3367d6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

/* Secondary Button */
.btn-secondary {
    padding: 12px 24px;
    border-radius: 8px;
    background: white;
    color: #666;
    border: 2px solid #e0e0e0;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    border-color: #4285f4;
    color: #4285f4;
}
```

### 📝 **Form Elements**
```css
/* Input Fields */
.form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #4285f4;
}

/* Labels */
.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
}

/* Form Groups */
.form-group {
    margin-bottom: 20px;
}
```

### 📅 **Calendar Components**
```css
/* Calendar Grid */
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    margin-bottom: 24px;
}

/* Calendar Day */
.calendar-day {
    aspect-ratio: 1;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
}

.calendar-day:hover {
    border-color: #4285f4;
    background: #f8f9ff;
}

.calendar-day.selected {
    background: #4285f4;
    color: white;
    border-color: #4285f4;
}

.calendar-day.disabled {
    background: #f5f5f5;
    color: #ccc;
    cursor: not-allowed;
}
```

### ⏰ **Time Slots**
```css
/* Time Slots Grid */
.time-slots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
}

/* Time Slot Base */
.time-slot {
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    font-weight: 500;
}

.time-slot:hover {
    border-color: #4285f4;
    background: #f8f9ff;
}

.time-slot.selected {
    background: #4285f4;
    color: white;
    border-color: #4285f4;
}

/* Time Slot Status Colors */
.time-slot.unavailable {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
    border-color: #ddd;
}

.time-slot.travel {
    background: #e1bee7;
    border-color: #9c27b0;
    color: #4a148c;
}

.time-slot.online {
    background: #bbdefb;
    border-color: #2196f3;
    color: #0d47a1;
}

.time-slot.other {
    background: #c8e6c9;
    border-color: #4caf50;
    color: #1b5e20;
}
```

### 🏷️ **Legend & Status**
```css
/* Legend Container */
.legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin: 24px 0;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}

/* Legend Item */
.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

/* Legend Colors */
.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
}

.legend-color.gray { 
    background: #f5f5f5; 
    border: 1px solid #ddd; 
}
.legend-color.purple { 
    background: #e1bee7; 
}
.legend-color.blue { 
    background: #bbdefb; 
}
.legend-color.green { 
    background: #c8e6c9; 
}
```

### 📊 **Step Indicator**
```css
/* Step Indicator Container */
.step-indicator {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
}

/* Individual Step */
.step {
    display: flex;
    align-items: center;
    margin: 0 16px;
}

/* Step Number Circle */
.step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e8f0fe;
    color: #4285f4;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 8px;
}

.step-number.active {
    background: #4285f4;
    color: white;
}

/* Step Text */
.step-text {
    font-size: 14px;
    color: #666;
}

.step-text.active {
    color: #4285f4;
    font-weight: 600;
}
```

### 📋 **Summary Box**
```css
/* Booking Summary */
.booking-summary {
    background: #f8f9ff;
    border: 1px solid #e3f2fd;
    border-radius: 8px;
    padding: 20px;
    margin: 24px 0;
}

.booking-summary h4 {
    color: #4285f4;
    margin-bottom: 12px;
}

/* Summary Items */
.summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
}

.summary-label {
    color: #666;
}

.summary-value {
    font-weight: 500;
}
```

### 📱 **Mobile Responsive**
```css
/* Mobile Breakpoint: 768px */
@media (max-width: 768px) {
    .container {
        margin: 0;
        border-radius: 0;
        min-height: 100vh;
    }
    
    .content {
        padding: 20px;
    }
    
    .time-slots {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .button-group {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
    }
}
```

### ✅ **Success State**
```css
/* Success Message */
.success-message {
    text-align: center;
    padding: 40px;
}

/* Success Icon */
.success-icon {
    width: 64px;
    height: 64px;
    background: #4caf50;
    border-radius: 50%;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32px;
}
```

---

## 🔧 **การนำไปใช้ใน Figma:**

### 1. **สร้าง Color Styles:**
- Primary Blue: `#4285f4`
- Success Green: `#4caf50`  
- Purple: `#9c27b0`
- Text Gray: `#666`

### 2. **สร้าง Text Styles:**
- Heading 1: `28px, Weight 600`
- Heading 3: `18px, Weight 500`
- Body: `16px, Weight 400`
- Small: `14px, Weight 400`

### 3. **สร้าง Component Variants:**
- Button (Primary/Secondary)
- Time Slot (Default/Selected/Unavailable/Travel/Online/Other)
- Calendar Day (Default/Selected/Disabled)
- Form Input (Default/Focus)

### 4. **Auto Layout Settings:**
- Calendar Grid: `7 columns, 8px gap`
- Time Slots: `Auto-fit, min 120px, 12px gap`
- Form Groups: `Vertical, 20px gap`
- Button Group: `Horizontal, 16px gap`

### 5. **ใช้ Grid Layout:**
- Calendar: `7x3 grid system`
- Time Slots: `Responsive grid`
- Mobile: `2 column time slots`

คัดลอก styles เหล่านี้ไปใส่ใน Figma Design System ของคุณได้เลยครับ! 🎨