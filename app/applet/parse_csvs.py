import glob, csv, json, re

files = [
    'public/assets/aistudio/KAPEL_JURUG_7c59cbc9.csv',
    'public/assets/aistudio/KAPEL_KALIDUREN_0c1141ea.csv',
    'public/assets/aistudio/BARANG_HIBAH_031aec63.csv',
    'public/assets/aistudio/KAPEL_DEMANGAN_862e8641.csv',
    'public/assets/aistudio/KAPEL_SUMBERSARI_71a9bfb6.csv',
    'public/assets/aistudio/KAPEL_METES_7133b988.csv',
    'public/assets/aistudio/TIMPEL_KOMSOS_f85cc095.csv',
    'public/assets/aistudio/GEREJA_SEDAYU_04f7482c.csv'
]

all_items = []
ast_counter = 1

def clean_price(val):
    if not val:
        return 0
    # remove Rp, commas, dots, etc.
    s = str(val).lower().replace('rp', '').replace('.', '').replace(',', '').strip()
    match = re.search(r'\d+', s)
    if match:
        return int(match.group())
    return 0

for filepath in files:
    print('Processing:', filepath)
    with open(filepath, encoding='utf-8', errors='ignore') as f:
        reader = list(csv.reader(f))
        # Find header row
        header_idx = -1
        for idx, row in enumerate(reader):
            joined = ' '.join(row).lower()
            if 'nama barang' in joined or 'nama' in joined and 'kode' in joined:
                header_idx = idx
                break
        
        if header_idx == -1:
            # fallback: look for rows with numbers
            header_idx = 4 # default header row in many template CSVs
            
        print(f'  Header index: {header_idx}')
        headers = reader[header_idx] if header_idx < len(reader) else []
        print(f'  Headers: {headers}')
        
        for r_idx in range(header_idx + 1, len(reader)):
            row = reader[r_idx]
            if not any(row) or not row[0].strip().isdigit():
                continue
            
            # Extract fields based on typical columns
            # [No, Nama Barang, Kode Aset, Bulan, Tahun, Harga/Nilai, Quantity, Kondisi, Lokasi, Pengguna, Keterangan]
            # Let's pad row to 12 elements
            while len(row) < 12:
                row.append('')
                
            no, nama, kode_aset, bulan, tahun, harga_str, qty_str, kondisi, lokasi, pengguna, ket = row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10] if len(row)>10 else ''
            
            # Skip karaoke set
            if 'karaoke' in nama.lower() or 'karaoke' in ket.lower():
                print('  SKIPPING KARAOKE ITEM:', nama)
                continue
                
            if not nama.strip():
                continue
                
            # Parse quantity
            qty = 1
            qty_clean = re.search(r'\d+', str(qty_str))
            if qty_clean:
                qty = int(qty_clean.group())
                
            # Parse year
            tahun_val = 2024
            tahun_clean = re.search(r'\d{4}', str(tahun))
            if tahun_clean:
                tahun_val = int(tahun_clean.group())
            else:
                # check in nama or keterangan
                tc = re.search(r'\b(19\d{2}|20\d{2})\b', nama + ' ' + ket)
                if tc:
                    tahun_val = int(tc.group(1))
                    
            # Parse price & market estimation
            harga = clean_price(harga_str)
            if harga == 0:
                # Estimate market price at acquisition year based on item type
                if 'tanah' in nama.lower():
                    harga = 150000000
                elif 'bangunan' in nama.lower():
                    harga = 75000000
                elif 'altar' in nama.lower() or 'mimbar' in nama.lower():
                    harga = 7500000
                elif 'kursi' in nama.lower():
                    harga = 350000
                elif 'meja' in nama.lower():
                    harga = 2500000
                elif 'proyektor' in nama.lower() or 'projector' in nama.lower():
                    harga = 5000000
                elif 'kipas' in nama.lower():
                    harga = 600000
                elif 'sound' in nama.lower() or 'speaker' in nama.lower() or 'mixer' in nama.lower():
                    harga = 4500000
                else:
                    harga = 1250000
            
            # Determine jenis aset kode
            jenis_kode = '401'
            nama_lower = nama.lower()
            if 'tanah' in nama_lower:
                jenis_kode = '100'
            elif 'bangunan' in nama_lower or 'kapel' in nama_lower or 'pendopo' in nama_lower:
                jenis_kode = '200'
            elif 'elektronik' in nama_lower or 'proyektor' in nama_lower or 'sound' in nama_lower or 'speaker' in nama_lower or 'mixer' in nama_lower or 'amplifier' in nama_lower:
                jenis_kode = '403'
            elif 'motor' in nama_lower or 'sepeda' in nama_lower:
                jenis_kode = '404'
            elif 'komunikasi' in nama_lower or 'hp' in nama_lower or 'radio' in nama_lower:
                jenis_kode = '405'
            elif 'dapur' in nama_lower or 'piring' in nama_lower or 'gelas' in nama_lower:
                jenis_kode = '406'
            elif 'buku' in nama_lower or 'kitab' in nama_lower:
                jenis_kode = '407'
            elif 'besi' in nama_lower or 'logam' in nama_lower or 'stainless' in nama_lower:
                jenis_kode = '501'
            elif 'ac' in nama_lower or 'pendingin' in nama_lower:
                jenis_kode = '502'
            
            # Format standard kodeAset: Xxx-xxxx-x-xx-xx-xxx
            # e.g., 401-2024-1-01-99-001
            if not kode_aset or len(kode_aset.split('-')) != 6:
                seq_str = f'{ast_counter:03d}'
                kode_aset = f'{jenis_kode}-{tahun_val}-1-01-99-{seq_str}'
                
            cond = 'Baik'
            if 'rusak' in kondisi.lower():
                cond = 'Rusak Ringan'
            elif 'sedang' in kondisi.lower():
                cond = 'Rusak Sedang'
            elif 'berat' in kondisi.lower():
                cond = 'Rusak Berat'
            elif not kondisi.strip():
                cond = 'Baik'
            else:
                cond = kondisi.strip()
                
            loc = lokasi.strip() if lokasi.strip() else 'Gereja Paroki Sedayu'
            user_pg = pengguna.strip() if pengguna.strip() else 'Umat & Pengurus'
            
            item = {
                "id": f"AST-{ast_counter:04d}",
                "kodeAset": kode_aset,
                "namaBarang": nama.strip(),
                "jenisAsetKode": jenis_kode,
                "jenisAsetName": f"Kelompok Aset {jenis_kode}",
                "timpelKode": "D",
                "timpelName": "Rumah Tangga & Perlengkapan",
                "tahunPerolehan": tahun_val,
                "bulanPerolehan": bulan.strip() if bulan.strip() else "-",
                "hargaNilai": harga,
                "quantity": qty,
                "satuan": "unit",
                "kondisi": cond,
                "lokasi": loc,
                "teritori": "Paroki",
                "peruntukan": "01",
                "ruangKode": "99",
                "ruangNama": "Umum / Serbaguna",
                "pengguna": user_pg,
                "statusPeminjaman": "Tersedia",
                "keterangan": ket.strip() if ket.strip() else f"Inventaris Paroki Sedayu ({filepath.split('/')[-1]})",
                "terakhirOpname": "2026-10-15"
            }
            all_items.append(item)
            ast_counter += 1

print(f'Total parsed items: {len(all_items)}')
