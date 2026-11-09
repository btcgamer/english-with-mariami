"""Private local setup: a fixed project and an integrity-checked admin migration.
No bearer token is printed, saved, passed as a command argument or sent to the app.
"""
import getpass
import hashlib
import json
import os
from pathlib import Path
import sys
import urllib.error
import urllib.request

PROJECT = 'vtdhvsfqhwesxtwmduew'
ADMIN_EMAIL = 'datogringo@gmail.com'
API = 'https://api.supabase.com/v1/projects/' + PROJECT
SQL_SHA256 = 'b690a702c051d1bdb4003bcc157ac87e9f3728a6432c88a9df0b48e0d6f273e9'
VERIFY_SQL = """select u.email, p.role,
  (u.raw_app_meta_data->>'mariami_admin' = 'true') as admin_verified
from auth.users u join public.profiles p on p.user_id = u.id
where lower(u.email) = 'datogringo@gmail.com';"""

class SetupError(Exception):
    pass

def request_json(method, url, token, body=None):
    if url not in (API, API + '/database/query'):
        raise SetupError('მოთხოვნის მისამართი არასწორია. მოქმედება შეჩერებულია.')
    request = urllib.request.Request(url, method=method,
        data=None if body is None else json.dumps(body).encode('utf-8'),
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json',
                 'User-Agent': 'Mariami-local-admin-setup/1.0'})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as error:
        if error.code in (401, 403):
            raise SetupError('ტოკენი არასწორია, ვადაგასულია ან ამ პროექტზე საჭირო უფლებები არ აქვს.') from None
        if error.code == 404:
            raise SetupError('პროექტი ვერ მოიძებნა ან შენს ანგარიშს მასზე წვდომა არ აქვს.') from None
        if error.code == 400:
            # Recognize only our own migration errors; never display raw server bodies.
            message = error.read(16384).decode('utf-8', errors='replace')
            if 'designated admin must already have a verified account' in message:
                raise SetupError('ჯერ დარეგისტრირდი საიტზე datogringo@gmail.com-ით და დაადასტურე ელფოსტა. შემდეგ ხელახლა გაუშვი ეს პროგრამა.') from None
            if 'Expected exactly one existing profile' in message:
                raise SetupError('ამ ანგარიშის პროფილი ვერ დადასტურდა. ცვლილებები გაუქმებულია; საჭიროა პროფილის შემოწმება Supabase-ში.') from None
        raise SetupError('Supabase-მა ოპერაცია ვერ შეასრულა (HTTP {}). ადმინისტრატორის ჩართვა არ დადასტურებულა.'.format(error.code)) from None
    except (urllib.error.URLError, TimeoutError, OSError):
        raise SetupError('Supabase-თან კავშირი ვერ დამყარდა. შეამოწმე ინტერნეტი და სცადე ხელახლა.') from None
    except (ValueError, UnicodeError):
        raise SetupError('Supabase-ის პასუხი ვერ დადასტურდა.') from None

def apply_admin(token, sql, transport=request_json):
    token = token.strip()
    if not token or any(c.isspace() for c in token):
        raise SetupError('ტოკენი ცარიელია ან შეიცავს გამოტოვებებს. დააკოპირე ხელახლა.')
    normalized = sql.replace('\r\n', '\n')
    if hashlib.sha256(normalized.encode('utf-8')).hexdigest() != SQL_SHA256:
        raise SetupError('SQL ფაილი შეცვლილია. გამოიყენე თავდაპირველი არქივი; ცვლილება არ შესრულებულა.')
    project = transport('GET', API, token)
    if not isinstance(project, dict) or project.get('id') != PROJECT:
        raise SetupError('საიტის პროექტი ვერ დადასტურდა. ცვლილება არ შესრულებულა.')
    transport('POST', API + '/database/query', token, {'query': normalized, 'read_only': False})
    rows = transport('POST', API + '/database/query', token, {'query': VERIFY_SQL, 'read_only': True})
    if not isinstance(rows, list) or len(rows) != 1:
        raise SetupError('მოთხოვნა დასრულდა, მაგრამ ადმინისტრატორის სტატუსის შემოწმება ვერ მოხერხდა. სტატუსი Supabase-ში გადაამოწმე.')
    row = rows[0]
    if str(row.get('email', '')).strip().lower() != ADMIN_EMAIL or row.get('role') != 'admin' or row.get('admin_verified') is not True:
        raise SetupError('ადმინისტრატორის სტატუსი ვერ დადასტურდა. სტატუსი Supabase-ში გადაამოწმე.')
    return True

def launch_gui():
    import tkinter as tk
    import queue
    import threading
    root = tk.Tk()
    root.title('English with Mariami — ადმინისტრატორი')
    root.geometry('650x420')
    root.minsize(550, 330)
    root.configure(padx=24, pady=20)
    tk.Label(root, text='ადმინისტრატორის ჩართვა', font=('Segoe UI', 18)).pack(anchor='w')
    tk.Label(root, text=ADMIN_EMAIL, font=('Segoe UI', 12)).pack(anchor='w', pady=(8,16))
    import webbrowser
    tk.Button(root, text='ტოკენის გვერდის გახსნა ↗', command=lambda: webbrowser.open('https://supabase.com/dashboard/account/tokens')).pack(anchor='w', pady=(0,10))
    tk.Label(root, text='Supabase-ში დაკოპირებული ტოკენი აქ ჩასვი:', font=('Segoe UI', 11)).pack(anchor='w')
    entry = tk.Entry(root, show='*', font=('Segoe UI', 13))
    entry.pack(fill='x', pady=(8,14))
    entry.focus_set()
    status = tk.Label(root, text='ტოკენი ფაილში არ შეინახება და მხოლოდ Supabase-ს გაეგზავნება.',
                      font=('Segoe UI', 10), justify='left', wraplength=590)
    status.pack(anchor='w', pady=(10,0))
    messages = queue.Queue()
    outcome = [1]
    def submit():
        token = entry.get().strip()
        if not token:
            status.configure(text='ჯერ ჩასვი ტოკენი.')
            return
        entry.delete(0, 'end')
        entry.configure(state='disabled')
        button.configure(state='disabled')
        status.configure(text='ვამოწმებთ საიტის პროექტს და ვრთავთ ადმინისტრატორს…')
        def work():
            try:
                sql = Path(__file__).with_name('set-designated-admin.sql').read_text(encoding='utf-8')
                apply_admin(token, sql)
                messages.put((True, 'წარმატებულია: datogringo@gmail.com — admin. საიტიდან გამოდი და ხელახლა შედი. Play Store-ის გადახდები ამ მოქმედებით არ აქტიურდება.'))
            except SetupError as error:
                messages.put((False, str(error)))
            except Exception:
                messages.put((False, 'მოქმედება ვერ დადასტურდა. შეამოწმე სრული ZIP პაკეტი და ინტერნეტი. ტოკენი ჩატში არ გამოგზავნო.'))
        threading.Thread(target=work, daemon=True).start()
    button = tk.Button(root, text='ადმინისტრატორის ჩართვა', command=submit, font=('Segoe UI', 11), padx=14, pady=8)
    button.pack(anchor='w', pady=14, before=status)
    def poll():
        try:
            success, text = messages.get_nowait()
            outcome[0] = 0 if success else 1
            status.configure(text=text)
            if not success:
                entry.configure(state='normal')
                button.configure(state='normal')
        except queue.Empty:
            pass
        root.after(100, poll)
    root.after(100, poll)
    root.mainloop()
    return outcome[0]

def main():
    if os.name == 'nt':
        try:
            return launch_gui()
        except ImportError:
            pass  # Console fallback if this Python installation omitted Tk.
    print('English with Mariami — ადმინისტრატორის ჩართვა')
    print('ანგარიში: ' + ADMIN_EMAIL)
    print('საჭიროა ამ საიტის Supabase პროექტის მართვის ტოკენი.')
    print('ტოკენის ჩასმისას ასოები არ გამოჩნდება — ეს ნორმალურია. ჩასმის შემდეგ დააჭირე Enter-ს.')
    print('ტოკენი შენს კომპიუტერში არ შეინახება და მხოლოდ Supabase-ს გაეგზავნება.\n')
    if not sys.stdin.isatty():
        print('გახსენით START-ADMIN.cmd ჩვეულებრივ Windows ფანჯარაში.')
        return 1
    try:
        token = getpass.getpass('Supabase token: ')
        sql = Path(__file__).with_name('set-designated-admin.sql').read_text(encoding='utf-8')
        apply_admin(token, sql)
        print('\nწარმატებულია: ' + ADMIN_EMAIL + ' — admin.')
        print('გამოდი საიტის ანგარიშიდან და ხელახლა შედი, რომ უფლებები განახლდეს.')
        print('ეს მოქმედება Play Store-ის გადახდებს არ ააქტიურებს.')
        return 0
    except (SetupError, FileNotFoundError, EOFError) as error:
        print('\n' + (str(error) if isinstance(error, SetupError) else 'პაკეტი არასრულია ან შეყვანა შეწყდა. თავიდან ამოარქივე სრული ZIP.'))
        return 1
    except Exception:
        print('მოქმედება ვერ დადასტურდა. საიდუმლო მონაცემები ჩატში არ გამოგზავნო.')
        return 1
    except KeyboardInterrupt:
        print('\nმოქმედება შეწყვეტილია.')
        return 1
    finally:
        token = None

if __name__ == '__main__':
    sys.exit(main())
