import importlib.util
import io
from pathlib import Path
import unittest
from unittest.mock import patch
import urllib.error

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('local_admin_setup', ROOT / 'setup-windows/setup_admin.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
SQL = (ROOT / 'setup-windows/set-designated-admin.sql').read_text()
TOKEN = 'test-only-not-a-real-secret'

class AdminSetupTests(unittest.TestCase):
    def transport(self, rows=None, project=None):
        calls = []
        def run(method, url, token, body=None):
            calls.append((method,url,token,body))
            if method == 'GET': return project if project is not None else {'id': module.PROJECT}
            if body['read_only']: return rows if rows is not None else [{'email': module.ADMIN_EMAIL, 'role':'admin', 'admin_verified': True}]
            return []
        return run,calls
    def test_verified_admin_only_after_database_readback(self):
        run,calls = self.transport()
        self.assertTrue(module.apply_admin(TOKEN,SQL,run))
        self.assertEqual(len(calls),3)
        self.assertFalse(calls[1][3]['read_only'])
        self.assertTrue(calls[2][3]['read_only'])
        self.assertTrue(all(c[1].startswith(module.API) for c in calls))
    def test_wrong_project_never_writes(self):
        run,calls=self.transport(project={'id':'another-project'})
        with self.assertRaises(module.SetupError):module.apply_admin(TOKEN,SQL,run)
        self.assertEqual(len(calls),1)
    def test_modified_sql_never_contacts_service(self):
        run,calls=self.transport()
        with self.assertRaises(module.SetupError):module.apply_admin(TOKEN,SQL+'\nselect 1;',run)
        self.assertEqual(calls,[])
    def test_windows_newlines_are_supported(self):
        run,_=self.transport()
        self.assertTrue(module.apply_admin(TOKEN,SQL.replace('\n','\r\n'),run))
    def test_empty_or_multiline_tokens_never_contact_service(self):
        for token in ['', 'abc\nxyz', 'abc def']:
            run,calls=self.transport()
            with self.assertRaises(module.SetupError):module.apply_admin(token,SQL,run)
            self.assertEqual(calls,[])
    def test_readback_must_confirm_exact_admin_and_protected_flag(self):
        for rows in [[],[{'email':'another@example.test','role':'admin','admin_verified':True}],[{'email':module.ADMIN_EMAIL,'role':'student','admin_verified':True}],[{'email':module.ADMIN_EMAIL,'role':'admin','admin_verified':False}],[{'email':module.ADMIN_EMAIL,'role':'admin','admin_verified':True}]*2]:
            run,_=self.transport(rows=rows)
            with self.assertRaises(module.SetupError):module.apply_admin(TOKEN,SQL,run)
    def test_credentials_never_appear_in_error_messages(self):
        error=urllib.error.HTTPError(module.API,403,TOKEN,{},io.BytesIO(TOKEN.encode()))
        with patch.object(module.urllib.request,'urlopen',side_effect=error):
            with self.assertRaises(module.SetupError) as captured:module.request_json('GET',module.API,TOKEN)
        self.assertNotIn(TOKEN,str(captured.exception))
    def test_unexpected_destinations_are_rejected(self):
        with self.assertRaises(module.SetupError):module.request_json('POST','https://example.test',TOKEN,{})
    def test_missing_account_gets_actionable_error_without_raw_server_body(self):
        text=('designated admin must already have a verified account '+TOKEN).encode()
        error=urllib.error.HTTPError(module.API,400,'error',{},io.BytesIO(text))
        with patch.object(module.urllib.request,'urlopen',side_effect=error):
            with self.assertRaises(module.SetupError) as captured:module.request_json('POST',module.API+'/database/query',TOKEN,{})
        self.assertIn(module.ADMIN_EMAIL,str(captured.exception));self.assertNotIn(TOKEN,str(captured.exception))

if __name__=='__main__':unittest.main()
