"""
build_data.py
=============
Run manually:  python build_data.py
Auto-run:      Push updated files to reports/ folder on GitHub
               (GitHub Actions handles the rest via .github/workflows/build_data.yml)

Report files expected in reports/ folder:
  reports/XTIME_RO_DATA.xlsx
  reports/DMS_RO_REPORT1.xlsx   (can be .xls — convert to .xlsx first if needed)
  reports/DMS_RO_REPORT2.xlsx

Output: base.js (line 1 data blob updated, rest of file unchanged)
"""

import json, re, openpyxl
from datetime import datetime
from collections import defaultdict

XTIME_PATH  = 'reports/XTIME_RO_DATA.xlsx'
DMS1_PATH   = 'reports/DMS_RO_REPORT1.xlsx'
DMS2_PATH   = 'reports/DMS_RO_REPORT2.xlsx'
OUTPUT_PATH = 'js/core/base.js'

TECH_ROSTER = {
    "EXPRESS": ["Alex Gourley","Christian Johnson","Duong Troung","Jacob Rumley",
                "John Ginter","Jonathan Estrada","Landon Pennington","Miguel Cisneros","Morgan Volpicella"],
    "KIA":     ["Caleb Walley","Dan Womack","Hank Beard","Luis Bondi",
                "Luis Rivas","Marcus Frazier","Rocco Statsmann"],
}
ADVISOR_ROSTER = ["Andrew Lapach","Taegan Baeriswyl","Paige Stevenson","Taylor Henson",
                  "Brandon Blackmon","Corey Suter","Darnell Reese","Noah Duby","Raquel Casteel"]

SECTIONS = [
    {"name":"Maintenance","categories":["ROTATE","WIPER BLADES","ALIGNMENT","BATTERY","SPARK PLUGS","ENGINE AIR FILTER","CABIN AIR FILTER"]},
    {"name":"Fluids","categories":["MOA OIL ADDITIVE","CF5 - FUEL TREATMENT","CFS - FUEL INDUCTION SERVICE","BRAKE FLUID EXCHANGE","ENGINE COOLANT","TRANS FLUID"]},
    {"name":"Brakes","categories":["FRONT BRAKES & ROTORS (RED)","FRONT BRAKES & ROTORS (YELLOW)","REAR BRAKES & ROTORS (RED)","REAR BRAKES & ROTORS (YELLOW)","TOTAL BRAKES & ROTORS (RED)","TOTAL BRAKES & ROTORS (YELLOW)","TOTAL BRAKES & ROTORS"]},
    {"name":"Tires","categories":["TWO TIRES (RED)","TWO TIRES (YELLOW)","FOUR TIRES (RED)","FOUR TIRES (YELLOW)","TOTAL SETS OF 2 TIRES (RED)","TOTAL SETS OF 2 TIRES (YELLOW)"]},
    {"name":"Other","categories":["OTHER"]},
]
FLUID_CATS = ["BRAKE FLUID EXCHANGE","CF5 - FUEL TREATMENT","CFS - FUEL INDUCTION SERVICE","ENGINE COOLANT","MOA OIL ADDITIVE","TRANS FLUID"]
ALL_CATS = [c for s in SECTIONS for c in s["categories"]]
NON_FLUID_PRIMARY = [c for c in ["ROTATE","WIPER BLADES","ALIGNMENT","BATTERY","SPARK PLUGS","ENGINE AIR FILTER","CABIN AIR FILTER","FRONT BRAKES & ROTORS (RED)","FRONT BRAKES & ROTORS (YELLOW)","REAR BRAKES & ROTORS (RED)","REAR BRAKES & ROTORS (YELLOW)","TWO TIRES (RED)","TWO TIRES (YELLOW)","FOUR TIRES (RED)","FOUR TIRES (YELLOW)","OTHER"] if c in ALL_CATS]
ALL_TECH_NAMES = [t for team in TECH_ROSTER.values() for t in team]

# XTIME has typos for some names — map them to the canonical roster name
XTIME_NAME_FIX = {
    "Lanedon Pennington": "Landon Pennington",
    "Micguel Cisneros":   "Miguel Cisneros",
}

# ── DMS SW-code → Advisor name ────────────────────────────────────────────────
# Derived by matching RO numbers between XTIME and DMS files.
DMS_SW_ADVISOR = {
    '175': 'Taegan Baeriswyl',
    '552': 'Paige Stevenson',
    '786': 'Darnell Reese',
    '900': 'Andrew Lapach',
    '984': 'Taylor Henson',
    '328': 'Noah Duby',
}

# ── DMS Labor Op → Category ───────────────────────────────────────────────────
# Maps DMS labor operation codes to the same category names used in XTIME.
# These represent advisor pre-MPI sold lines (written up before tech inspection).
DMS_LABOR_OP_CAT = {
    'MOA':    'MOA OIL ADDITIVE',
    'CF5':    'CF5 - FUEL TREATMENT',
    'CFS':    'CFS - FUEL INDUCTION SERVICE',
    'BRAKEF': 'BRAKE FLUID EXCHANGE',
    'CSS':    'ENGINE COOLANT',
    'TR':     'TRANS FLUID',
    'ALIGN':  'ALIGNMENT',
    'ROTATE': 'ROTATE',
    'WB':     'WIPER BLADES',
    'FWIPER': 'WIPER BLADES',
    'RWIPER': 'WIPER BLADES',
    'AF':     'ENGINE AIR FILTER',
    'CF':     'CABIN AIR FILTER',
    'FBS':    'FRONT BRAKES & ROTORS (RED)',
    'RBS':    'REAR BRAKES & ROTORS (RED)',
    '1TIRE':  'TWO TIRES (RED)',
    '2TIRE':  'TWO TIRES (RED)',
    '4TIRE':  'FOUR TIRES (RED)',
    'RBATT':  'BATTERY',
    '4PLUG':  'SPARK PLUGS',
    '6PLUG':  'SPARK PLUGS',
}

# ── Text → category rules ─────────────────────────────────────────────────────
RULES = [
    (["rotate tires","tire rotation","tire balance and rotate","tires - rotate","tires - rotate & balance"],"ROTATE"),
    (["wiper blade","back glass wiper"],"WIPER BLADES"),
    (["wheel alignment","four wheel alignment"],"ALIGNMENT"),
    (["battery - replace","battery - test","battery service","battery cable","battery cable battery"],"BATTERY"),
    (["spark plugs","replace spark plugs"],"SPARK PLUGS"),
    (["engine air filter element","replace air cleaner element","replace engine air filter"],"ENGINE AIR FILTER"),
    (["cabin air filter","replace air conditioner filter","replace cabin air filter"],"CABIN AIR FILTER"),
    (["moa oil additive"],"MOA OIL ADDITIVE"),
    (["cf5 fuel treatment"],"CF5 - FUEL TREATMENT"),
    (["fuel induction service"],"CFS - FUEL INDUCTION SERVICE"),
    (["brake system fluid","replace brake/clutch fluid","drain, refill and bleed the brake system","brake system fluid - drain"],"BRAKE FLUID EXCHANGE"),
    (["replace engine coolant","engine coolant system","hybrid inverter coolant"],"ENGINE COOLANT"),
    (["transmission fluid","replace automatic transaxle fluid","replace dual clutch transmission fluid",
      "replace ivt transmission fluid","replace transmission fluid","replace transfer case oil",
      "replace rear differential fluid","replace power steering fluid"],"TRANS FLUID"),
    (["brake pads (front)","brake pads & rotors (front)","brake pads and rotors (front)","brake rotor (front)"],"FRONT BRAKES"),
    (["brake pads (rear)","brake pads & rotors (rear)","brake pads and rotors (rear)","brake rotor (rear)"],"REAR BRAKES"),
    (["replace 4 tires","tires - replace"],"FOUR TIRES"),
    (["replace 1 tire","replace 2 tires","replace 3 tires"],"TWO TIRES"),
]

def classify(text):
    lo = text.lower()
    color = "YELLOW" if "(yellow)" in lo else "RED"
    for patterns, base in RULES:
        for p in patterns:
            if p in lo:
                if base == "FRONT BRAKES": return f"FRONT BRAKES & ROTORS ({color})"
                if base == "REAR BRAKES":  return f"REAR BRAKES & ROTORS ({color})"
                if base == "TWO TIRES":    return f"TWO TIRES ({color})"
                if base == "FOUR TIRES":   return f"FOUR TIRES ({color})"
                return base
    return "OTHER"

# ── Load XTIME ────────────────────────────────────────────────────────────────
print("Loading XTIME...")
wb = openpyxl.load_workbook(XTIME_PATH, read_only=True, data_only=True)
ws = wb.active
xtime_ros = {}
cur_ro = None

for row in ws.iter_rows(min_row=7, values_only=True):
    ro_raw = row[0]; dms_raw = row[2]; adv = row[16]; tech = row[17]
    odo_raw = row[15]; sold_text = row[22]; unsold_text = row[23]

    if ro_raw is not None and str(ro_raw) != 'History':
        try:
            ro_num = str(int(ro_raw))
        except:
            ro_num = str(ro_raw)
        dms_close = None
        if dms_raw:
            if isinstance(dms_raw, datetime):
                dms_close = dms_raw.strftime('%Y-%m-%d')
            else:
                for fmt in ('%m/%d/%Y','%Y-%m-%d','%m/%d/%y'):
                    try: dms_close = datetime.strptime(str(dms_raw).strip(), fmt).strftime('%Y-%m-%d'); break
                    except: pass
        odo = 0
        try: odo = float(str(odo_raw).replace(',',''))
        except: pass
        if ro_num not in xtime_ros:
            raw_tech = str(tech).strip() if tech else None
            xtime_ros[ro_num] = {
                'tech': XTIME_NAME_FIX.get(raw_tech, raw_tech),
                'advisor': str(adv).strip() if adv else None,
                'dms_close': dms_close, 'odo': odo,
                'sold_cats': set(), 'asr_cats': set(),
            }
        cur_ro = ro_num

    if cur_ro is None: continue
    for (txt, slot) in [(sold_text,'sold'),(unsold_text,'unsold')]:
        if not txt: continue
        cat = classify(str(txt).strip().lstrip('-').strip())
        xtime_ros[cur_ro]['asr_cats'].add(cat)
        if slot == 'sold':
            xtime_ros[cur_ro]['sold_cats'].add(cat)

wb.close()
print(f"  {len(xtime_ros)} XTIME ROs loaded")

# Derive totals per RO
for ro in xtime_ros.values():
    for col in ('sold_cats','asr_cats'):
        cats = ro[col]
        fr = "FRONT BRAKES & ROTORS (RED)" in cats; fy = "FRONT BRAKES & ROTORS (YELLOW)" in cats
        rr = "REAR BRAKES & ROTORS (RED)" in cats;  ry = "REAR BRAKES & ROTORS (YELLOW)" in cats
        if fr or rr: cats.add("TOTAL BRAKES & ROTORS (RED)")
        if fy or ry: cats.add("TOTAL BRAKES & ROTORS (YELLOW)")
        if fr or fy or rr or ry: cats.add("TOTAL BRAKES & ROTORS")
        t2r = "TWO TIRES (RED)" in cats; t2y = "TWO TIRES (YELLOW)" in cats
        t4r = "FOUR TIRES (RED)" in cats; t4y = "FOUR TIRES (YELLOW)" in cats
        if t2r or t4r: cats.add("TOTAL SETS OF 2 TIRES (RED)")
        if t2y or t4y: cats.add("TOTAL SETS OF 2 TIRES (YELLOW)")
    ro['sold_cats'] = sorted(ro['sold_cats'])
    ro['asr_cats']  = sorted(ro['asr_cats'])

# ── Load DMS (pre-MPI advisor sold lines) ────────────────────────────────────
print("Loading DMS files for pre-MPI advisor sold lines...")
# advisor_sold_cats[advisor_name][category] = count of pre-MPI sold lines
advisor_sold_cats = defaultdict(lambda: defaultdict(int))

for dms_path in [DMS1_PATH, DMS2_PATH]:
    wb2 = openpyxl.load_workbook(dms_path, read_only=True, data_only=True)
    ws2 = wb2.active
    for row in ws2.iter_rows(min_row=3, values_only=True):
        sw  = str(row[0]).strip() if row[0] else None
        lo  = str(row[2]).strip() if row[2] else None
        if not sw or not lo or sw == 'Serv Wtr' or lo == 'Labor Oper':
            continue
        adv_name = DMS_SW_ADVISOR.get(sw)
        if not adv_name:
            continue
        cat = DMS_LABOR_OP_CAT.get(lo)
        if not cat:
            continue
        advisor_sold_cats[adv_name][cat] += 1
    wb2.close()

# Derive brake/tire totals for DMS pre-MPI as well
for adv_name, cats in advisor_sold_cats.items():
    fr = cats.get("FRONT BRAKES & ROTORS (RED)", 0)
    rr = cats.get("REAR BRAKES & ROTORS (RED)", 0)
    if fr or rr:
        cats["TOTAL BRAKES & ROTORS (RED)"] += (fr + rr)
        cats["TOTAL BRAKES & ROTORS"] += (fr + rr)
    t2r = cats.get("TWO TIRES (RED)", 0)
    t4r = cats.get("FOUR TIRES (RED)", 0)
    if t2r or t4r:
        cats["TOTAL SETS OF 2 TIRES (RED)"] += (t2r + t4r * 2)

for adv_name, cats in advisor_sold_cats.items():
    print(f"  DMS pre-MPI {adv_name}: {sum(cats.values())} lines across {len(cats)} categories")

# ── Aggregation helpers ───────────────────────────────────────────────────────
def pct(a,b): return round(a/b,4) if b else None

def build_entry(ros_list, is_advisor=False, adv_name=None):
    n = len(ros_list)
    cat_asr = defaultdict(int); cat_sold = defaultdict(int)
    odo_sum = 0; odo_cnt = 0
    ro_rows = []
    for ro in ros_list:
        if ro['odo']: odo_sum += ro['odo']; odo_cnt += 1
        for c in ro['asr_cats']:  cat_asr[c]  += 1
        for c in ro['sold_cats']: cat_sold[c] += 1
        ro_rows.append({'ro':ro['ro_num'],'dms_close':ro['dms_close'],'odo':ro['odo'],
                        'asr_cats':ro['asr_cats'],'sold_cats':ro['sold_cats']})
    avg_odo = round(odo_sum/odo_cnt,0) if odo_cnt else 0

    # Pre-MPI sold counts from DMS (advisor write-up sales, before tech inspection)
    pre_mpi = advisor_sold_cats.get(adv_name, {}) if (is_advisor and adv_name) else {}

    cats = {}
    for c in ALL_CATS:
        a = cat_asr.get(c,0); s = cat_sold.get(c,0)
        e = {'asr':a,'req':round(a/n,4) if n else 0.0,'sold':s,'close':pct(s,a)}
        if is_advisor:
            adv_s = pre_mpi.get(c, 0)
            sold_total = s + adv_s
            e.update({
                'advisor_sold': adv_s,
                'sold_total':   sold_total,
                'sold_ro':      round(sold_total/n,4) if n else 0.0,
            })
        cats[c] = e

    def bkt(cat_list):
        a = sum(cat_asr.get(c,0) for c in cat_list)
        s = sum(cat_sold.get(c,0) for c in cat_list)
        b = {'asr':a,'asr_per_ro':round(a/n,4) if n else 0.0,'sold':s,'sold_pct':pct(s,a)}
        if is_advisor:
            adv_s = sum(pre_mpi.get(c,0) for c in cat_list)
            sold_total = s + adv_s
            b.update({
                'advisor_sold': adv_s,
                'sold_total':   sold_total,
                'sold_ro':      round(sold_total/n,4) if n else 0.0,
            })
        return b

    summary = {'without_fluids':bkt(NON_FLUID_PRIMARY),'fluids_only':bkt(FLUID_CATS),'total':bkt(NON_FLUID_PRIMARY+FLUID_CATS)}
    return {'ros':n,'odo':avg_odo,'summary':summary,'categories':cats,'ro_rows':ro_rows}

# ── Tech entries ──────────────────────────────────────────────────────────────
print("Assembling tech entries...")
tech_ros = defaultdict(list)
for ro_num, ro in xtime_ros.items():
    t = ro.get('tech')
    if t and t in ALL_TECH_NAMES:
        tech_ros[t].append({'ro_num':ro_num,**ro})

all_dates = []
tech_entries = []
for team_name, members in TECH_ROSTER.items():
    for tech_name in members:
        ros_list = tech_ros.get(tech_name,[])
        print(f"  {tech_name}: {len(ros_list)} ROs")
        for r in ros_list:
            if r['dms_close']: all_dates.append(r['dms_close'])
        e = build_entry(ros_list, False)
        e.update({'id':tech_name.lower().replace(' ','_'),'name':tech_name,'team':team_name})
        tech_entries.append(e)

# Total row
dedup = {}
for t in ALL_TECH_NAMES:
    for ro in tech_ros.get(t,[]):
        if ro['ro_num'] not in dedup: dedup[ro['ro_num']] = ro
total_e = build_entry(list(dedup.values()), False)
total_e.update({'id':'total','name':'ALL TECHNICIANS','team':'ALL'})
total_e.pop('ro_rows',None)
tech_entries.append(total_e)

# ── Advisor entries ───────────────────────────────────────────────────────────
print("Assembling advisor entries...")
adv_ros = defaultdict(list)
for ro_num, ro in xtime_ros.items():
    a = ro.get('advisor')
    if a and a in ADVISOR_ROSTER:
        adv_ros[a].append({'ro_num':ro_num,**ro})

advisor_entries = []
for adv_name in ADVISOR_ROSTER:
    ros_list = adv_ros.get(adv_name,[])
    print(f"  {adv_name}: {len(ros_list)} ROs")
    e = build_entry(ros_list, True, adv_name=adv_name)
    e.update({'id':adv_name.lower().replace(' ','_'),'name':adv_name,'team':'ADVISORS'})
    advisor_entries.append(e)

# ── Write output ──────────────────────────────────────────────────────────────
def fmt_d(d):
    if not d: return ''
    try:
        dt = datetime.strptime(d,'%Y-%m-%d')
        return f"{dt.month}/{dt.day}/{dt.year}"
    except: return d

min_d = min(all_dates) if all_dates else ''
max_d = max(all_dates) if all_dates else ''

DATA = {
    "meta": {"file":"XTIME+DMS 3_10_26","generated_on":datetime.today().strftime('%Y-%m-%d'),
             "date_range":f"{fmt_d(min_d)} – {fmt_d(max_d)}"},
    "teams": list(TECH_ROSTER.keys()),
    "sections": SECTIONS,
    "fluid_categories": FLUID_CATS,
    "techs": tech_entries,
    "advisors": advisor_entries,
}

print(f"Writing {OUTPUT_PATH} ...")
new_data_line = 'const DATA = ' + json.dumps(DATA, separators=(',',':')) + ';\n'

# Preserve everything after line 1 of existing base.js
try:
    with open(OUTPUT_PATH) as f:
        existing_lines = f.readlines()
    rest = existing_lines[1:] if len(existing_lines) > 1 else []
except FileNotFoundError:
    rest = []

with open(OUTPUT_PATH,'w') as f:
    f.write(new_data_line)
    f.writelines(rest)

import os
print(f"Done. {os.path.getsize(OUTPUT_PATH)/1024:.1f} KB")
print(f"Date range: {fmt_d(min_d)} - {fmt_d(max_d)}")
print("ASR source: XTIME Sold Lines + Unsold Lines.")
print("Pre-MPI advisor_sold: DMS labor op lines (write-up sales before tech inspection).")
