# Phase 5: Update general use case diagram with 5 new use cases
$f = "d:\projects\iot_reap\internshipReport\plantuml\iot-reap-general-use-case.puml"
$c = [System.IO.File]::ReadAllText($f)

# 1. Add Google OAuth use case in "Public Access and Discovery" package
# Insert after "View Reviews" line
$marker1 = 'usecase "View Reviews" as UC_ViewReviews'
$insert1 = 'usecase "View Reviews" as UC_ViewReviews`r`n  usecase "Google OAuth Login" as UC_GoogleOAuth'
$c = $c.Replace($marker1, $insert1)

# 2. Add 4 new admin use cases in "Remote Laboratory and Administration" package
# Insert after "Approve VM Assignments" line
$marker2 = 'usecase "Approve VM Assignments" as UC_ApproveVMA'
$insert2 = 'usecase "Approve VM Assignments" as UC_ApproveVMA`r`n  usecase "View Activity Logs" as UC_ActivityLogs`r`n  usecase "Moderate Forum Posts" as UC_ForumMod`r`n  usecase "Manage VM Reservations" as UC_VMRes`r`n  usecase "Manage Camera Reservations" as UC_CamRes'
$c = $c.Replace($marker2, $insert2)

# 3. Add Guest association for Google OAuth
# Insert after "Guest --> UC_ViewReviews"
$marker3 = "Guest --> UC_ViewReviews"
$insert3 = "Guest --> UC_ViewReviews`r`nGuest --> UC_GoogleOAuth"
$c = $c.Replace($marker3, $insert3)

# 4. Add Admin associations for 4 new use cases
# Insert after "Admin --> UC_ApproveVMA"
$marker4 = "Admin --> UC_ApproveVMA"
$insert4 = "Admin --> UC_ApproveVMA`r`nAdmin --> UC_ActivityLogs`r`nAdmin --> UC_ForumMod`r`nAdmin --> UC_VMRes`r`nAdmin --> UC_CamRes"
$c = $c.Replace($marker4, $insert4)

[System.IO.File]::WriteAllText($f, $c)
Write-Output "Phase 5 complete. File size: $($c.Length)"

# Verify
$checks = @("UC_GoogleOAuth", "UC_ActivityLogs", "UC_ForumMod", "UC_VMRes", "UC_CamRes", "Guest --> UC_GoogleOAuth", "Admin --> UC_ActivityLogs", "Admin --> UC_ForumMod", "Admin --> UC_VMRes", "Admin --> UC_CamRes")
foreach ($check in $checks) {
    if ($c.Contains($check)) { Write-Output "VERIFIED: $check found" } else { Write-Output "MISSING: $check NOT found" }
}
