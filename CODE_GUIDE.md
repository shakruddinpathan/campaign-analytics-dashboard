# Code Guide: har file aasan bhasha mein

Ye guide sirf aapke liye hai, taaki aap pura code samajh sako aur interview mein confidently explain kar sako. (Chahein toh GitHub par push karne se pehle ise hata sakte ho.)

---

## Data kaise flow hota hai (sabse pehle ye samjho)

```
MOCK_DATA (3,176 rows, date ke order mein)
   │
   ▼
useFilters ──► filters (date, campaign, source)
   │
   ▼
useDashboardData
   ├─ filterRecordsCached  → binary search + LRU cache
   ├─ calculateKpis        → KPI cards
   ├─ groupAndSum          → bar chart + pie chart (hash map)
   ├─ topK                 → Top 5 campaigns (min-heap)
   └─ movingAverage        → revenue chart ki 7-day line (sliding window)
   │
   ▼
DataTable → useTableData
   ├─ debounce search
   ├─ mergeSort
   └─ paginate → screen par sirf 25 rows
```

Simple rule: **algorithms/** aur **utils/** mein logic hai, **hooks/** mein state hai, aur **components/** sirf screen par dikhate hain.

---

## Root ki files

| File | Kya karti hai |
| --- | --- |
| `package.json` | Project ki libraries aur commands (`dev`, `build`, `test`) |
| `vite.config.ts` | Vite ko React aur Tailwind ke saath chalata hai. Highcharts ko alag file (chunk) mein daalta hai taaki browser use cache kar sake. |
| `tsconfig.json` | TypeScript ke rules. `strict: true` matlab TypeScript chhoti galtiyan bhi pakdega. |
| `jest.config.cjs` | Jest ko batata hai ki TypeScript tests `ts-jest` se chalao, aur browser jaisa environment (`jsdom`) do. |
| `index.html` | Ek hi HTML page. React app `<div id="root">` ke andar banta hai. |
| `vercel.json` | Vercel ko build command aur output folder batata hai. |
| `public/favicon.svg` | Browser tab ka chhota icon. |
| `components.json` | shadcn/ui ki settings. Isse aage `npx shadcn@latest add dialog` jaise command se naye components add kar sakte ho. |

---

## `src/types/index.ts`

Saare TypeScript types ek jagah: `CampaignRecord` (table ki ek row), `Filters`, `KpiTotals`, `GroupTotals`, `SortConfig`.
**Kyun:** agar data ka shape badle toh TypeScript har jagah error dikha dega, kuch chhootega nahi.

## `src/data/mockData.ts`

Nakli (dummy) lekin realistic data banata hai: 8 campaigns × 6 sources × 120 din ≈ 3,176 rows.
- **Seeded random generator:** `Math.random()` har reload par alag data deta. Seed se har baar **same data** aata hai, isliye screenshots aur tests hamesha match karte hain.
- Har source ka conversion rate alag hai (Email zyada, Instagram kam), aur weekend par traffic zyada hai. Isliye charts real lagte hain.
- Data **date ke order mein** hai. Binary search isi par depend karta hai.

---

## `src/algorithms/` (DSA wala folder)

Har file ke upar comment mein idea, "kyun" aur Big-O likha hai. Interview ke liye ye sabse important folder hai.

### `mergeSort.ts`: table sorting
- **Idea:** array ko aadha-aadha todte jao jab tak ek-ek item na bache, phir sorted pieces ko jodte jao.
- **Kyun merge sort:** ye **stable** hai, matlab barabar values wali rows ka purana order bana rehta hai. Aur worst case mein bhi O(n log n) hai.
- **Stable kaise bana:** `compare(...) <= 0`. Barabar hone par left wala pehle aata hai.
- Input array ko change nahi karta (React mein state immutable rakhni hoti hai).
- **Time O(n log n), Space O(n).**

### `binarySearch.ts`: date range filter
- **Idea:** sorted array mein beech wala item dekho. Chhota hai toh right half mein dhoondo, warna left half mein. Har step mein aadha data hat jaata hai.
- `lowerBound` = pehli row jiski date >= start. `upperBound` = pehli row jiski date > end. Phir beech ka `slice`.
- ISO dates (`"2026-07-05"`) ko string ki tarah compare kar sakte hain, isliye ye kaam karta hai.
- **Time O(log n)** (har row check karne mein O(n) lagta).

### `groupBy.ts`: hash map grouping
- Har row ko ek baar dekho, `Map` mein uske group (campaign/source) ke totals mein jod do.
- **Kyun Map:** group dhoondhna O(1) hai. Bina Map ke har row ke liye list mein dhoondhna padta.
- **Time O(n), Space O(k)** (k = groups ki ginti).
- `sumRevenueByDate` isi tarah har din ka revenue jodta hai, line chart ke liye.

### `paginate.ts`: pagination
- Page p, size s → rows `(p-1)×s` se `p×s` tak.
- **Clamping:** filter lagne ke baad agar page 30 exist nahi karta, toh aakhri page dikhata hai.
- Khaali list par bhi "Page 1 of 1" dikhata hai.

### `minHeap.ts`: Top 5 campaigns
- **Min-heap:** array mein bana tree jahan sabse chhota item hamesha index 0 par hota hai. Parent = `(i-1)/2`, children = `2i+1`, `2i+2`.
- **Top-K trick:** size 5 ka min-heap rakho. Root = abhi ke top 5 mein sabse kamzor. Naya item usse bada ho toh root nikalo, naya daalo.
- **Kyun sort nahi kiya:** sort O(n log n) hai, heap O(n log k) hai aur k = 5 bahut chhota hai.
- `bubbleUp` (insert ke baad upar le jao) aur `bubbleDown` (remove ke baad neeche le jao) heap ka rule bachate hain.

### `movingAverage.ts`: sliding window
- 7-day average = pichhle 7 din ka average.
- **Slow tarika:** har din 7 numbers dobara jodo, O(n × 7).
- **Sliding window:** ek running sum rakho. Naya din aaye toh **jodo**, 7 din purana nikle toh **ghatao**. Har step O(1).
- Pehle 6 din `null` aate hain kyunki poori window nahi bani. Highcharts `null` points skip kar deta hai.

### `memoize.ts`: LRU cache
- Same input aaye toh dobara calculate mat karo, save kiya hua result de do.
- **LRU:** cache mein sirf 50 entries. Bharne par sabse purana (Least Recently Used) hata do.
- **Trick:** JavaScript `Map` insertion order yaad rakhta hai, toh Map ki **pehli key = sabse purani**. Cache hit par key delete karke dobara daalte hain, taaki wo "naya" ban jaaye.

### `debounce.ts`: debounce
- User ruk jaaye tabhi function chalao. Har naya call purana timer cancel karta hai.
- "facebook" type karne par search 8 baar nahi, sirf 1 baar chalta hai.
- React wala version `hooks/useDebouncedValue.ts` mein hai, table usi ko use karta hai.

### `index.ts`
Saare algorithms ko ek jagah se export karta hai: `import { mergeSort, topK } from '../algorithms'`.

---

## `src/utils/`

| File | Kya karti hai |
| --- | --- |
| `format.ts` | Numbers ko Indian style mein dikhata hai: `12,34,567`, `₹13.9Cr`, `37.1L`, `05 Jul 2026`. Formatters ek baar bante hain, har render par nahi. |
| `kpi.ts` | KPI totals ek loop mein. Conversion rate = total conversions ÷ total clicks (har row ke rate ka average nahi, kyunki wo galat hota). |
| `filterRecords.ts` | Pehle binary search se date range, phir campaign/source check. `filterRecordsCached` = memoize wala version. `searchRecords` table ka text search hai. |
| `sortRecords.ts` | Table rows ko hamare merge sort se sort karta hai. Text ke liye `localeCompare`, numbers ke liye minus. `desc` ke liye result ulta. |
| `csv.ts` | Rows ko CSV text banata hai. Comma ya quote wali value ko `"..."` mein lapet-ta hai, warna Excel column tod deta. Download bina server ke Blob se hota hai. |
| `date.ts` | `"2026-07-05"` jaisi string aur Calendar ke `Date` object ke beech conversion, bina time-zone ki wajah se din shift hue. |
| `chartTheme.ts` | Highcharts Tailwind classes nahi padhta, isliye dark/light colours yahan se chart options mein jaate hain. |

---

## `src/hooks/`

| Hook | Kya karta hai |
| --- | --- |
| `useFilters` | Filter state rakhta hai. Default date range = poora data. `updateFilter(key, value)` ek generic function hai, chaar alag functions ki zaroorat nahi. |
| `useDashboardData` | Filters se sab nikalta hai: filtered rows, KPIs, groups, Top 5, moving average. Har cheez `useMemo` mein hai, toh theme badalne par data dobara calculate nahi hota. |
| `useTableData` | Table ki pipeline: search (debounced) → merge sort → paginate. Search ya filter badle toh page 1 par wapas. |
| `useDebouncedValue` | Value 300 ms tak na badle tabhi update hoti hai. Input box turant update hota hai, search baad mein. |
| `useTheme` | `<html>` par `dark` class lagata/hatata hai. Choice localStorage mein save. Pehli baar OS ki setting follow karta hai. localStorage error de toh bhi app chalti hai (`try/catch`). |

---

## `src/components/`

| Component | Kya karta hai |
| --- | --- |
| `Header` | Title aur dark/light button. `aria-label` screen reader ko batata hai button kya karega. |
| `FilterBar` | shadcn Card ke andar DateRangePicker, 2 shadcn Select (campaign, source) aur Reset button. |
| `DateRangePicker` | shadcn Button + Popover + Calendar (2 mahine). Pehla click nayi range shuru karta hai, doosra click range poori karke popover band karta hai. Data ke bahar ki dates disable hain. |
| `KpiCard` | shadcn Card par bana ek metric box, lucide icon ke saath. Chhota aur reusable. |
| `KpiGrid` | 4 KPI cards. Mobile par 1 column, desktop par 4. |
| `ChartCard` | Har chart ka shadcn Card + `Suspense`. Chart download hote waqt shadcn `Skeleton` (loading box) dikhata hai. |
| `TopCampaigns` | Top 5 list progress bars ke saath. Ranking pehle se `topK()` se aati hai, ye sirf dikhata hai. |
| `DataTable` | shadcn Table, Input (search), Button (Export CSV), sortable headers (arrow icons). Export **saari** matching rows deta hai, sirf current page nahi. `aria-sort` accessibility ke liye. Chhoti screen par table side mein scroll hoti hai. |
| `Pagination` | "Showing 1–25 of 3,176", shadcn Select se rows per page, icon buttons se First/Prev/Next/Last. |
| `charts/highcharts.ts` | Highcharts ko ek jagah import karta hai aur accessibility module add karta hai. |
| `charts/RevenueLineChart` | Daily revenue + 7-day moving average line. |
| `charts/ConversionsBarChart` | Campaign-wise conversions. Horizontal bars, kyunki lambe naam side mein fit hote hain. |
| `charts/SourcePieChart` | Source-wise clicks ka donut. |

Har chart `React.memo` mein hai aur options `useMemo` mein, kyunki naya options object milte hi Highcharts redraw karta hai.

## shadcn/ui wala hissa (`src/components/ui/` aur `src/lib/utils.ts`)

shadcn/ui koi normal library nahi hai. Ye components ka **source code** seedha aapke project mein copy karta hai, isliye aap har component padh aur badal sakte ho. Andar se ye **Radix UI** use karte hain, jo keyboard aur screen reader support deta hai.

| File | Kya hai |
| --- | --- |
| `ui/button.tsx` | Button, variants ke saath: `default`, `outline`, `ghost`, sizes `sm`, `icon`, `icon-sm`. `cva` library se variants bante hain. |
| `ui/card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent |
| `ui/select.tsx` | Dropdown (Radix Select) |
| `ui/table.tsx` | Styled table elements |
| `ui/popover.tsx`, `ui/calendar.tsx` | Date range picker ke liye. Calendar `react-day-picker` par bana hai. |
| `ui/input.tsx`, `ui/label.tsx`, `ui/skeleton.tsx` | Text box, label, loading box |
| `lib/utils.ts` | `cn()` helper: class names jodta hai aur Tailwind ke conflict hatata hai (`cn('px-2', 'px-4')` → `px-4`). |

Interview mein: "shadcn/ui isliye chuna kyunki code mere control mein rehta hai, Radix se accessibility milti hai, aur CSS variables se theming aasan hai."

## `App.tsx`, `main.tsx`, `index.css`
- `App.tsx`: sirf layout. Teeno charts `React.lazy` se load hote hain, taaki KPIs aur table pehle dikhein.
- `main.tsx`: React ko `#root` mein start karta hai. `StrictMode` development mein extra checks karta hai.
- `index.css`: Tailwind import aur shadcn ka theme. Components `bg-card`, `text-muted-foreground` jaise naam use karte hain, jo CSS variables (`--card`, `--primary` ...) se aate hain. Dark mode mein sirf variables badalte hain, saare components apne aap badal jaate hain. Brand colour badalna ho toh sirf `--primary` badlo.

## Tests (`__tests__` folders)
13 test files, 51 tests. Har algorithm, utils, `KpiCard`/`KpiGrid` aur `DataTable` (pagination, debounced search, sorting) test hote hain. Kai tests "fast algorithm ka result = simple slow tarike ka result" check karte hain. Ye correctness prove karne ka achha tarika hai.

---

## Local mein kaise chalayein

1. Node.js 20 ya naya install karo: https://nodejs.org
2. Zip extract karo, folder terminal mein kholo.
3. `npm install`
4. `npm run dev` → browser mein http://localhost:5173 kholo.
5. `npm test` → saare tests chalenge.
6. `npm run build` → production build check.

## GitHub par daalna

```bash
git init
git add .
git commit -m "Campaign Analytics Dashboard: React, TypeScript, Highcharts"
git branch -M main
git remote add origin https://github.com/shakruddin/campaign-analytics-dashboard.git
git push -u origin main
```
(Pehle GitHub par `campaign-analytics-dashboard` naam ki khaali repository bana lo.)

## Vercel par deploy

1. https://vercel.com par GitHub se login karo.
2. **Add New → Project** → apni repository chuno → **Import**.
3. Framework "Vite" apne aap aa jaayega. **Deploy** dabao.
4. 1–2 minute mein live link milega. Use README ke "Live demo" mein aur GitHub repo ke "About" mein daal do.
5. GitHub profile par ye repo **Pin** kar do, taaki purane HTML/CSS projects ki jagah ye sabse upar dikhe.

---

## Resume ke liye 2 bullet points

- Built a **Campaign Analytics Dashboard** with **React, TypeScript, shadcn/ui and Highcharts** for 3,000+ records, featuring KPI cards, interactive charts, filters, a searchable and sortable data table and CSV export, with dark mode and a responsive layout.
- Implemented core data logic from scratch, including **merge sort, binary-search date filtering, hash-map aggregation, a min-heap Top-K ranking, a sliding-window moving average and an LRU cache**, and covered it with **51 Jest unit tests**. Lazy-loaded charts and memoization keep the UI fast.

## Interview mein kaise explain karein (30 second)

"Maine ek campaign analytics dashboard banaya hai jo mere Trackier ke kaam jaisa hai. Data date ke order mein hai, toh date filter binary search se O(log n) mein hota hai. Campaign-wise totals hash map se ek pass mein bante hain. Top 5 campaigns ke liye maine min-heap use kiya, jo O(n log k) hai. Revenue chart ki 7-day line sliding window se O(n) mein banti hai. Same filter dobara lage toh LRU cache se result turant milta hai. Table mein stable merge sort aur debounced search hai."

---

## CRUD + Animations (naya feature)

Table mein ab rows **Add, Edit aur Delete** ho sakti hain, aur har action par animation chalta hai. KPIs aur charts turant update hote hain.

| File | Kya karti hai |
| --- | --- |
| `hooks/useRecords.ts` | CRUD state. Har change par **naya array** banta hai (immutable update), isliye `useMemo` sab dobara calculate karta hai. Nayi row `upperBound` (binary search) se sahi date position par insert hoti hai, kyunki date filter sorted data par depend karta hai. `lastChange` batata hai kaunsi row add/update hui. |
| `hooks/useToast.ts` + `components/Toaster.tsx` | Neeche-right notifications. 4 sec baad apne aap slide-out. Delete ke baad **Undo** button. |
| `components/ui/dialog.tsx` | shadcn Dialog (Radix). Khulte waqt fade + zoom + slide-up. |
| `components/RecordFormDialog.tsx` | Add aur Edit dono ke liye ek hi form. Validation: whole numbers, conversions ≤ clicks, date data range ke andar. Galat submit par form **shake** karta hai. |
| `lib/motion.ts` | `flashElement()` Web Animations API (`element.animate`) se row ko green (new) ya amber (updated) flash karta hai. Isse row re-mount kiye bina animation dobara chal sakta hai. |
| `index.css` | Custom keyframes: `row-in`, `row-exit`, `toast-in/out`, `shake`, `kpi-pop`, `fade-up`. `prefers-reduced-motion` wale users ke liye animation band. |

**Animations ka flow:**
- **Create:** table us page par jaata hai jahan nayi row hai, scroll karta hai, row green flash hoti hai.
- **Read:** page/sort/page-size badalne par rows halka stagger ke saath fade-in hoti hain. Sort arrow ghoom ke badalta hai.
- **Update:** row amber flash hoti hai; KPI numbers "pop" karte hain.
- **Delete:** row pehle 300ms mein right slide + fade hoti hai, **phir** data se hatti hai (`ROW_EXIT_MS`). Toast mein Undo.
- **Page load:** har section 70ms ke gap se neeche se upar fade hota hai.

**Ek bug jo fix kiya:** `filterRecordsCached` ki cache key mein pehle sirf filters the. Data ab badal sakta hai, isliye key mein dataset ka id bhi hai (`WeakMap`), warna purani rows dikhti.
**Page reset:** `useTableData` ab `resetKey` (filters) leta hai, taaki edit/delete karne par table page 1 par na kood jaaye.
