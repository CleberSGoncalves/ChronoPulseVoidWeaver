@echo off
echo [*] Sincronizando backup no GitHub (ChronoPulse: The Void Weaver)...
git add .
git commit -m "auto: deploy e build ChronoPulse: The Void Weaver (CrazyGames HTML5)"
git push -u origin main
echo [OK] Backup concluido com sucesso!
