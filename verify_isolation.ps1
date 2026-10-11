# verify_isolation.ps1 - checks the CTF targets stay sandboxed.
$fail = 0
function Ok($m)  { Write-Host "PASS  $m" }
function No($m)  { Write-Host "FAIL  $m"; $script:fail = 1 }

$targets = "ctf-stage4-web", "ctf-stage8-capstone"

foreach ($svc in $targets) {
    $cid = docker compose ps -q $svc
    if (-not $cid) { No "$svc is not running"; continue }

    # 1. No internet from the target
    docker compose exec -T $svc ping -c1 -W2 8.8.8.8 *> $null
    if ($LASTEXITCODE -eq 0) { No "$svc reached the internet" } else { Ok "$svc has no internet route" }

    # 2. Every network it is on is internal
    $nets = docker inspect $cid --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'
    $allInternal = $true
    foreach ($n in ($nets -split '\s+' | Where-Object { $_ })) {
        if ((docker network inspect $n --format '{{.Internal}}') -ne "true") { $allInternal = $false }
    }
    if ($allInternal) { Ok "$svc is on internal networks only" } else { No "$svc touches a public network" }

    # 3. Memory limit is set
    if ((docker inspect $cid --format '{{.HostConfig.Memory}}') -ne "0") { Ok "$svc has a memory limit" } else { No "$svc has no memory limit" }
}

# 4. No container mounts the Docker socket
$sock = docker ps -q | ForEach-Object { docker inspect $_ --format '{{.HostConfig.Binds}}' } | Select-String "docker.sock"
if ($sock) { No "a container mounts docker.sock" } else { Ok "no container mounts docker.sock" }

if ($fail -eq 0) { Write-Host "== ALL CHECKS PASSED ==" } else { Write-Host "== SOME CHECKS FAILED ==" }
exit $fail
