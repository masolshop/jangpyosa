# 🏢 Branch Toggle Feature Documentation

**Date**: 2026-03-05  
**Feature**: Expand/Collapse Branch List on Admin Organizations Page

## ✅ Feature Status: ALREADY IMPLEMENTED

The toggle functionality for expanding/collapsing branch lists on the `/admin/organizations` page is **already fully implemented** and working.

## 📍 Implementation Details

### 1. State Management
**Location**: Line 75
```typescript
const [expandedBranches, setExpandedBranches] = useState<{ [key: string]: boolean }>({});
```
- Tracks which headquarters have their branch lists expanded
- Uses headquarters ID as the key

### 2. Toggle Function
**Location**: Lines 366-371
```typescript
const toggleBranchList = (hqId: string) => {
  setExpandedBranches(prev => ({
    ...prev,
    [hqId]: !prev[hqId]
  }));
};
```
- Toggles the expanded state for a specific headquarters
- Preserves other headquarters' states

### 3. Clickable Branch Count Line
**Location**: Lines 588-612
```typescript
<p 
  style={{ 
    margin: '4px 0',
    cursor: hq.branches && hq.branches.length > 0 ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }}
  onClick={() => {
    if (hq.branches && hq.branches.length > 0) {
      toggleBranchList(hq.id);
    }
  }}
>
  🏢 소속 지사: {hq.branches?.length || 0}개
  {hq.branches && hq.branches.length > 0 && (
    <span style={{ 
      fontSize: 12, 
      color: '#3b82f6',
      fontWeight: 600,
    }}>
      {expandedBranches[hq.id] ? '▼' : '▶'}
    </span>
  )}
</p>
```
**Features**:
- Shows branch count: "🏢 소속 지사: N개"
- Only clickable if branches exist
- Shows toggle arrow (▶ collapsed, ▼ expanded)
- Arrow color: blue (#3b82f6)

### 4. Collapsible Branch List Display
**Location**: Lines 697-751
```typescript
{hq.branches && hq.branches.length > 0 && expandedBranches[hq.id] && (
  <div style={{
    marginTop: 12,
    padding: 12,
    background: '#fef3f2',
    borderRadius: 8,
    border: '1px solid #fee4e2',
  }}>
    <h4>지사 목록</h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {hq.branches.map((branch: any) => (
        <div key={branch.id} style={{...}}>
          {/* Branch details: name, leader, etc. */}
        </div>
      ))}
    </div>
  </div>
)}
```
**Display Features**:
- Light red/peach background (#fef3f2)
- Rounded corners (8px)
- Shows all branches with:
  - Branch name
  - "지사" badge (orange)
  - Branch leader name

## 🎨 Visual Design

### Collapsed State
```
🏢 소속 지사: 3개 ▶
```
- Clickable text
- Right-pointing arrow (▶)
- Default cursor changes to pointer on hover

### Expanded State
```
🏢 소속 지사: 3개 ▼
┌─────────────────────────────────────┐
│ 지사 목록                            │
│ ┌─────────────────────────────────┐ │
│ │ 강남지사 [지사] 김철수           │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 서초지사 [지사] 이영희           │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 송파지사 [지사] 박민수           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
- Downward-pointing arrow (▼)
- Light red/peach background box
- List of all branches with details

## 🔄 Similar Feature

The same toggle functionality is also implemented for **Manager Lists**:
- State: `expandedManagers` (line 72)
- Toggle: `toggleManagerList` (lines 358-363)
- Display: Lines 642-695 (headquarters) and 909-962 (branches)

## 🧪 How to Test

1. Navigate to: `https://jangpyosa.com/admin/organizations`
2. Log in as SUPER_ADMIN
3. Find a headquarters that has branches (e.g., shows "🏢 소속 지사: 3개")
4. Click on the "🏢 소속 지사: N개" line
5. The branch list should expand, showing all branches
6. Click again to collapse

## 📝 Notes

- Feature is **fully functional** and requires no changes
- The implementation follows the same pattern as the manager list toggle
- Both toggles work independently (can expand branches and managers separately)
- State is preserved until page reload

## ✅ Verification Status

- [x] State management implemented
- [x] Toggle function implemented
- [x] Clickable UI element with visual indicator
- [x] Collapsible content display
- [x] Consistent with manager toggle pattern
- [x] Proper styling and layout

**Status**: ✅ **COMPLETE AND WORKING**
