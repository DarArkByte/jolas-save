<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$_rawInput = '';
if (!empty($_POST)) {
    $GLOBALS['_REQUEST_BODY_PARSED'] = $_POST;
} else {
    $_rawInput = @file_get_contents('php://input') ?: '';
    if ($_rawInput) {
        $GLOBALS['_REQUEST_BODY_PARSED'] = json_decode($_rawInput, true) ?? [];
    } else {
        $GLOBALS['_REQUEST_BODY_PARSED'] = [];
    }
}
$GLOBALS['_REQUEST_BODY'] = $_rawInput;

set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'file' => basename($e->getFile()), 'line' => $e->getLine()]);
    exit;
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        echo json_encode(['fatal' => $error['message'], 'file' => basename($error['file']), 'line' => $error['line']]);
    }
});

define('DB_HOST', 'localhost');
define('DB_NAME', 'jolascom_jolassave');
define('DB_USER', 'jolascom_jolasuser');
define('DB_PASS', 'JolasDB@Secure2026!');
define('JWT_SECRET', 'jolas-save-jwt-secret-key-prod-2026-secure');

function getDB() {
    static $pdo = null;
    if ($pdo) return $pdo;
    $pdo = new PDO(
        'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4',
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4']
    );
    return $pdo;
}

function b64e($d) { return rtrim(strtr(base64_encode($d), '+/', '-_'), '='); }
function b64d($d) { return base64_decode(str_pad(strtr($d, '-_', '+/'), strlen($d) % 4 == 0 ? strlen($d) : strlen($d) + 4 - strlen($d) % 4, '=', STR_PAD_RIGHT)); }

function jwt_sign($payload) {
    $h = b64e(json_encode(['typ'=>'JWT','alg'=>'HS256']));
    $b = b64e(json_encode($payload));
    $s = b64e(hash_hmac('sha256', "$h.$b", JWT_SECRET, true));
    return "$h.$b.$s";
}

function jwt_verify($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($h, $b, $s) = $parts;
    if (!hash_equals(b64e(hash_hmac('sha256', "$h.$b", JWT_SECRET, true)), $s)) return null;
    $p = json_decode(b64d($b), true);
    if (isset($p['exp']) && $p['exp'] < time()) return null;
    return $p;
}

function get_session() {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (strpos($auth, 'Bearer ') === 0) return jwt_verify(substr($auth, 7));
    if (!empty($_COOKIE['token'])) return jwt_verify($_COOKIE['token']);
    return null;
}

function require_session() {
    $s = get_session();
    if (!$s) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); exit; }
    return $s;
}

function body() {
    $b = $GLOBALS['_REQUEST_BODY_PARSED'] ?? [];
    if (empty($b)) $b = $_POST ?? [];
    if (empty($b)) $b = $_GET ?? [];
    return $b;
}
function out($d, $c=200) { http_response_code($c); echo json_encode($d); exit; }
function hash_pw($p) { return password_hash($p, PASSWORD_BCRYPT, ['cost'=>10]); }
function verify_pw($p, $h) { return password_verify($p, $h); }

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$uri = strtok($uri, '?');
$route = preg_replace('#^/api#', '', $uri);
$route = rtrim($route, '/') ?: '/';

if ($route === '/health') {
    getDB()->query("SELECT 1");
    out(['status'=>'ok','database'=>'MySQL','host'=>'cPanel jolascom_jolassave','php'=>PHP_VERSION,'timestamp'=>date('c')]);
}

if ($route === '/auth/login' && $method === 'POST') {
    $b = body();
    $eu = strtolower($b['emailOrUsername'] ?? '');
    $pw = $b['passwordHash'] ?? '';
    if (!$eu || !$pw) out(['success'=>false,'error'=>'Email and password required.'], 400);
    $stmt = getDB()->prepare("SELECT * FROM `User` WHERE LOWER(email)=? OR LOWER(username)=? LIMIT 1");
    $stmt->execute([$eu, $eu]); $u = $stmt->fetch();
    if (!$u || !verify_pw($pw, $u['passwordHash'])) out(['success'=>false,'error'=>'Invalid credentials.'], 401);
    $token = jwt_sign(['id'=>$u['id'],'username'=>$u['username'],'role'=>$u['role'],'exp'=>time()+86400]);
    setcookie('token',$token,['expires'=>time()+86400,'path'=>'/','httponly'=>true,'samesite'=>'Strict']);
    unset($u['passwordHash']);
    $u['isKycVerified']=(bool)$u['isKycVerified']; $u['twoFactorEnabled']=(bool)$u['twoFactorEnabled'];
    out(['success'=>true,'user'=>$u,'token'=>$token]);
}

if ($route === '/auth/register' && $method === 'POST') {
    $b = body();
    $p = $b['profile'] ?? [];
    if (is_string($p)) { $p = json_decode($p, true) ?? []; }
    $pw = $b['passwordHash'] ?? ''; $role = $b['role'] ?? 'Customer';
    $db = getDB();
    $ex = $db->prepare("SELECT id FROM `User` WHERE username=? OR email=?");
    $ex->execute([$p['username']??'',$p['email']??'']);
    if ($ex->fetch()) out(['success'=>false,'error'=>'Username or email already exists.'],400);
    $id = bin2hex(random_bytes(16));
    $db->prepare("INSERT INTO `User` (id,fullName,username,email,phoneNumber,passportPhoto,dob,gender,address,state,lga,occupation,nextOfKinName,nextOfKinRelationship,nextOfKinPhone,bankName,accountNumber,accountName,bvn,nin,referralCode,referredBy,isKycVerified,kycStatus,twoFactorEnabled,status,passwordHash,role) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        ->execute([$id,$p['fullName']??'',$p['username']??'',$p['email']??'',$p['phoneNumber']??'',$p['passportPhoto']??null,$p['dob']??'',$p['gender']??'',$p['address']??'',$p['state']??'',$p['lga']??'',$p['occupation']??'',$p['nextOfKin']['name']??'',$p['nextOfKin']['relationship']??'',$p['nextOfKin']['phoneNumber']??'',$p['bankName']??'',$p['accountNumber']??'',$p['accountName']??'',$p['bvn']??null,$p['nin']??null,$p['referralCode']??null,$p['referredBy']??null,$p['isKycVerified']??0,$p['kycStatus']??'Unverified',$p['twoFactorEnabled']??0,$p['status']??'Active',hash_pw($pw),$role]);
    $nu = $db->prepare("SELECT * FROM `User` WHERE id=?"); $nu->execute([$id]); $u=$nu->fetch();
    unset($u['passwordHash']); $u['isKycVerified']=(bool)$u['isKycVerified']; $u['twoFactorEnabled']=(bool)$u['twoFactorEnabled'];
    out(['success'=>true,'user'=>$u]);
}

if ($route === '/auth/logout' && $method === 'POST') { setcookie('token','',['expires'=>time()-3600,'path'=>'/']); out(['success'=>true]); }

if ($route === '/users' && $method === 'GET') {
    $users = getDB()->query("SELECT id,fullName,username,email,phoneNumber,passportPhoto,dob,gender,address,state,lga,occupation,nextOfKinName,nextOfKinRelationship,nextOfKinPhone,bankName,accountNumber,accountName,bvn,nin,referralCode,referredBy,isKycVerified,kycStatus,twoFactorEnabled,status,role,assignedAgentUsername,createdAt FROM `User`")->fetchAll();
    foreach ($users as &$u) { $u['isKycVerified']=(bool)$u['isKycVerified']; $u['twoFactorEnabled']=(bool)$u['twoFactorEnabled']; }
    out($users);
}

if ($route === '/banks/verify' && $method === 'GET') {
    $acc = $_GET['accountNumber'] ?? '';
    $code = $_GET['bankCode'] ?? '';
    if (strlen($acc) !== 10) out(['success'=>false, 'error'=>'Account number must be 10 digits.'], 400);
    // Check if an external Paystack/Flutterwave/Monnify API key is set in environment or database
    $paystackKey = getenv('PAYSTACK_SECRET_KEY');
    if ($paystackKey && $code) {
        $ch = curl_init("https://api.paystack.co/bank/resolve?account_number=$acc&bank_code=$code");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $paystackKey"]);
        $res = curl_exec($ch);
        curl_close($ch);
        $data = json_decode($res, true);
        if ($data && isset($data['status']) && $data['status'] === true && isset($data['data']['account_name'])) {
            out(['success'=>true, 'accountName'=>$data['data']['account_name']]);
        }
    }
    out(['success'=>false, 'error'=>'No live bank verification API key configured. Please use "Option B: Enter Bank Details Manually".'], 400);
}

if ($route==='/goals' && $method==='GET') { out(getDB()->query("SELECT * FROM SavingsGoal ORDER BY createdAt DESC")->fetchAll()); }
if ($route==='/goals/mine' && $method==='GET') {
    $s=require_session();
    $g=getDB()->prepare("SELECT * FROM SavingsGoal WHERE username=? ORDER BY createdAt DESC"); $g->execute([$s['username']]); out($g->fetchAll());
}
if ($route==='/goals' && $method==='POST') {
    $b=body();
    $g = isset($b['goal']) ? $b['goal'] : $b;
    if (is_string($g)) { $g = json_decode($g, true) ?? []; }
    $s = get_session();
    $u = !empty($b['username']) ? $b['username'] : ($s ? $s['username'] : ($g['username'] ?? ''));
    $id = !empty($g['id']) ? $g['id'] : ('goal-' . bin2hex(random_bytes(8)));
    $db=getDB();
    $db->prepare("INSERT INTO SavingsGoal (id,name,category,targetAmount,frequency,expectedDeposit,amountSaved,startDate,endDate,withdrawalDate,reminderEnabled,imageUrl,notes,status,apy,accruedInterest,username) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,?)")
       ->execute([$id,$g['name']??'Goal',$g['category']??'General',$g['targetAmount']??0,$g['frequency']??'Monthly',$g['expectedDeposit']??0,$g['amountSaved']??0,$g['startDate']??date('Y-m-d'),$g['endDate']??date('Y-m-d'),$g['withdrawalDate']??date('Y-m-d'),isset($g['reminderEnabled']) ? ($g['reminderEnabled']?1:0) : 1,$g['imageUrl']??null,$g['notes']??null,$g['status']??'Active',$u]);
    out(['success'=>true, 'id'=>$id]);
}

if ($route==='/deposit-requests' && $method==='GET') {
    $s=get_session(); $db=getDB();
    if ($s && in_array($s['role'],['Admin','Agent','Super Admin'])) {
        $r=$db->query("SELECT * FROM DepositRequest ORDER BY updatedAt DESC")->fetchAll();
    } else if ($s) {
        $st=$db->prepare("SELECT * FROM DepositRequest WHERE customerUsername=? ORDER BY updatedAt DESC");
        $st->execute([$s['username']]); $r=$st->fetchAll();
    } else {
        $r=[];
    }
    foreach ($r as &$dr) { $dr['auditLog']=json_decode($dr['auditLogJson']??'[]',true); }
    out($r);
}

if ($route==='/deposit-requests' && $method==='POST') {
    $s=require_session(); $b=body();
    $dr = isset($b['req']) ? $b['req'] : $b;
    if (is_string($dr)) { $dr = json_decode($dr, true) ?? []; }
    $db=getDB();
    $goalId = !empty($dr['goalId']) ? $dr['goalId'] : (!empty($b['goalId']) ? $b['goalId'] : '');
    $gq=$db->prepare("SELECT * FROM SavingsGoal WHERE id=?"); $gq->execute([$goalId]); $g=$gq->fetch();
    if (!$g) out(['error'=>'Goal not found.', 'receivedGoalId'=>$goalId],404);
    if ($g['username']!==$s['username']) out(['error'=>'Cannot deposit to another customer\'s goal.'],403);
    $amt = floatval($dr['amount'] ?? ($b['amount'] ?? 0));
    if ($amt <= 0) out(['error'=>'Amount must be > 0'],400);

    $activeCheck = $db->prepare("SELECT id FROM DepositRequest WHERE customerUsername=? AND goalId=? AND status IN ('Pending','Awaiting Verification','Waiting for WhatsApp Contact')");
    $activeCheck->execute([$s['username'], $g['id']]);
    $existing = $activeCheck->fetch();
    if ($existing) {
        out(['error'=>'You already have an active pending deposit request for this goal.', 'existingRequestId'=>$existing['id']], 409);
    }

    $reqId = !empty($dr['id']) ? $dr['id'] : ('DEP-' . time() . '-' . rand(1000,9999));
    $log=json_encode([['action'=>'Deposit Request Created','actor'=>$s['username'],'timestamp'=>date('c')]]);
    $db->prepare("INSERT INTO DepositRequest (id,customerId,customerName,customerPhone,customerUsername,goalId,goalName,amount,createdAt,status,proofOfPaymentUrl,notes,auditLogJson) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
       ->execute([$reqId,$s['username'],$dr['customerName']??'',$dr['customerPhone']??'',$s['username'],$g['id'],$g['name'],$amt,date('c'),'Pending',$dr['proofOfPaymentUrl']??null,$dr['notes']??null,$log]);
    out(['success'=>true, 'id'=>$reqId]);
}

if (preg_match('#^/deposit-requests/([^/]+)/approve$#',$route,$m) && $method==='POST') {
    $s=require_session();
    if (!in_array($s['role'],['Admin','Agent','Super Admin'])) out(['error'=>'Admin only'],403);
    $b=body();
    $paymentRef = $b['paymentReference'] ?? ($b['bankTxId'] ?? '');
    $notes = $b['notes'] ?? '';
    $db=getDB();
    $db->beginTransaction();
    try {
        $rq=$db->prepare("SELECT * FROM DepositRequest WHERE id=? FOR UPDATE"); $rq->execute([$m[1]]); $r=$rq->fetch();
        if (!$r) throw new Exception('Not found.');
        if (!in_array($r['status'],['Pending','Awaiting Verification','Waiting for WhatsApp Contact'])) throw new Exception("Cannot approve: {$r['status']}");
        $gq=$db->prepare("SELECT * FROM SavingsGoal WHERE id=? FOR UPDATE"); $gq->execute([$r['goalId']]); $g=$gq->fetch();
        if (!$g) throw new Exception('Goal not found.');
        
        $approvedAmount = floatval(!empty($b['approvedAmount']) ? $b['approvedAmount'] : $r['amount']);
        if ($approvedAmount <= 0) throw new Exception('Approved amount must be greater than zero.');
        
        $nb=$g['amountSaved']+$approvedAmount;
        $db->prepare("UPDATE SavingsGoal SET amountSaved=? WHERE id=?")->execute([$nb,$g['id']]);
        $rc = !empty($paymentRef) ? "REC-$paymentRef" : ('REC-'.time().'-'.rand(1000,9999));
        $db->prepare("INSERT INTO `Transaction` (id,receiptNumber,transactionId,goalName,goalId,amount,date,time,paymentMethod,balanceAfter,type,status,customerName) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
           ->execute([bin2hex(random_bytes(16)),$rc,$r['id'],$r['goalName'],$r['goalId'],$approvedAmount,date('Y-m-d'),date('H:i'),'Bank Transfer (Admin Verified)',$nb,'Deposit','Successful',$r['customerName']]);
        
        $notifMsg = "â‚¦" . number_format($approvedAmount, 2) . " has been added to your " . $r['goalName'] . " savings goal. New Balance: â‚¦" . number_format($nb, 2) . ".";
        $db->prepare("INSERT INTO Notification (id,title,message,date,time,isRead,type,username) VALUES (?,?,?,?,?,0,?,?)")
           ->execute([bin2hex(random_bytes(16)),'Deposit Approved ðŸŽ‰',$notifMsg,date('Y-m-d'),date('H:i'),'success',$r['customerUsername']]);
        
        $log=json_decode($r['auditLogJson']??'[]',true);
        $log[]=[
            'action'=>'Deposit Approved & Credited',
            'actor'=>$s['role'].' ('.$s['username'].')',
            'approvedAmount'=>$approvedAmount,
            'paymentReference'=>$paymentRef,
            'notes'=>$notes,
            'timestamp'=>date('c')
        ];
        $db->prepare("UPDATE DepositRequest SET status='Credited',approvedBy=?,approvedAt=?,receiptNumber=?,notes=?,auditLogJson=? WHERE id=?")
           ->execute([$s['role'].' ('.$s['username'].')',date('c'),$rc,$notes ?: ($r['notes'] ?? ''),json_encode($log),$m[1]]);
        $db->commit();
        out(['success'=>true,'receiptNumber'=>$rc,'newBalance'=>$nb,'approvedAmount'=>$approvedAmount]);
    } catch (Exception $e) { $db->rollBack(); out(['error'=>$e->getMessage()],400); }
}

if (preg_match('#^/deposit-requests/([^/]+)/decline$#',$route,$m) && $method==='POST') {
    $s=require_session();
    if (!in_array($s['role'],['Admin','Agent','Super Admin'])) out(['error'=>'Admin only'],403);
    $b=body(); $reason=$b['reason']??'Unverified payment proof'; $db=getDB();
    $rq=$db->prepare("SELECT * FROM DepositRequest WHERE id=?"); $rq->execute([$m[1]]); $r=$rq->fetch();
    if (!$r) out(['error'=>'Not found'],404);
    if (!in_array($r['status'],['Pending','Awaiting Verification','Waiting for WhatsApp Contact'])) out(['error'=>"Cannot decline: {$r['status']}"],400);
    $log=json_decode($r['auditLogJson']??'[]',true);
    $log[]=[
        'action'=>'Deposit Request Declined',
        'actor'=>$s['role'].' ('.$s['username'].')',
        'reason'=>$reason,
        'timestamp'=>date('c')
    ];
    $db->prepare("UPDATE DepositRequest SET status='Declined',declinedBy=?,declinedAt=?,declineReason=?,auditLogJson=? WHERE id=?")
       ->execute([$s['role'].' ('.$s['username'].')',date('c'),$reason,json_encode($log),$m[1]]);
    
    $notifMsg = "Your deposit request for " . $r['goalName'] . " (â‚¦" . number_format($r['amount'], 2) . ") was declined. Reason: $reason";
    $db->prepare("INSERT INTO Notification (id,title,message,date,time,isRead,type,username) VALUES (?,?,?,?,?,0,?,?)")
       ->execute([bin2hex(random_bytes(16)),'Deposit Request Declined âŒ',$notifMsg,date('Y-m-d'),date('H:i'),'error',$r['customerUsername']]);
    out(['success'=>true]);
}

if ($route==='/withdrawals' && $method==='GET') {
    $s=require_session();
    $db=getDB();
    if (in_array($s['role'],['Admin','Agent','Super Admin'])) {
        out($db->query("SELECT * FROM WithdrawalRequest ORDER BY createdAt DESC")->fetchAll());
    } else {
        $st=$db->prepare("SELECT * FROM WithdrawalRequest WHERE username=? ORDER BY createdAt DESC");
        $st->execute([$s['username']]);
        out($st->fetchAll());
    }
}

if ($route==='/withdrawals' && $method==='POST') {
    $s=require_session(); $b=body();
    $w = isset($b['req']) ? $b['req'] : $b;
    if (is_string($w)) { $w = json_decode($w, true) ?? []; }
    $db=getDB();
    $goalId = !empty($w['goalId']) ? $w['goalId'] : '';
    $gq=$db->prepare("SELECT * FROM SavingsGoal WHERE id=?"); $gq->execute([$goalId]); $g=$gq->fetch();
    if (!$g) out(['error'=>'Goal not found.'],404);
    if ($g['username']!==$s['username']) out(['error'=>'Cannot withdraw from another customer\'s goal.'],403);
    $amt = floatval($w['amount'] ?? 0);
    if ($amt <= 0) out(['error'=>'Withdrawal amount must be > 0'],400);
    if ($amt > floatval($g['amountSaved'])) out(['error'=>'Insufficient savings balance.'],400);

    $id = !empty($w['id']) ? $w['id'] : ('WDR-' . time() . '-' . rand(1000,9999));
    $db->prepare("INSERT INTO WithdrawalRequest (id,username,customerName,goalId,goalName,amount,bankName,accountNumber,accountName,status,date,time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
       ->execute([$id,$s['username'],$s['username'],$g['id'],$g['name'],$amt,$w['bankName']??'',$w['accountNumber']??'',$w['accountName']??'','Pending',date('Y-m-d'),date('H:i')]);
    
    $db->prepare("INSERT INTO Notification (id,title,message,date,time,isRead,type,username) VALUES (?,?,?,?,?,0,?,?)")
       ->execute([bin2hex(random_bytes(16)),'Withdrawal Submitted ⏳',"Withdrawal request for ₦".number_format($amt,2)." submitted for {$g['name']}.",date('Y-m-d'),date('H:i'),'info',$s['username']]);

    out(['success'=>true, 'id'=>$id]);
}

if (preg_match('#^/withdrawals/([^/]+)/approve$#',$route,$m) && $method==='POST') {
    $s=require_session();
    if (!in_array($s['role'],['Admin','Agent','Super Admin'])) out(['error'=>'Admin only'],403);
    $db=getDB(); $db->beginTransaction();
    try {
        $wq=$db->prepare("SELECT * FROM WithdrawalRequest WHERE id=? FOR UPDATE"); $wq->execute([$m[1]]); $w=$wq->fetch();
        if (!$w) throw new Exception('Withdrawal not found.');
        if ($w['status'] !== 'Pending') throw new Exception("Cannot approve: already {$w['status']}");
        $gq=$db->prepare("SELECT * FROM SavingsGoal WHERE id=? FOR UPDATE"); $gq->execute([$w['goalId']]); $g=$gq->fetch();
        if (!$g) throw new Exception('Goal not found.');
        if (floatval($g['amountSaved']) < floatval($w['amount'])) throw new Exception('Insufficient funds in customer goal.');
        
        $nb = floatval($g['amountSaved']) - floatval($w['amount']);
        $db->prepare("UPDATE SavingsGoal SET amountSaved=? WHERE id=?")->execute([$nb, $g['id']]);
        $db->prepare("UPDATE WithdrawalRequest SET status='Approved',approvedBy=?,approvedAt=? WHERE id=?")
           ->execute([$s['role'].' ('.$s['username'].')',date('c'),$m[1]]);

        $rc = 'REC-WDR-'.time().'-'.rand(1000,9999);
        $db->prepare("INSERT INTO `Transaction` (id,receiptNumber,transactionId,goalName,goalId,amount,date,time,paymentMethod,balanceAfter,type,status,customerName) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
           ->execute([bin2hex(random_bytes(16)),$rc,$w['id'],$w['goalName'],$w['goalId'],$w['amount'],date('Y-m-d'),date('H:i'),'Bank Payout',$nb,'Withdrawal','Successful',$w['customerName']]);

        $db->prepare("INSERT INTO Notification (id,title,message,date,time,isRead,type,username) VALUES (?,?,?,?,?,0,?,?)")
           ->execute([bin2hex(random_bytes(16)),'Withdrawal Approved 🎉',"₦".number_format($w['amount'],2)." payout approved to {$w['bankName']} ({$w['accountNumber']}).",date('Y-m-d'),date('H:i'),'success',$w['username']]);

        $db->commit();
        out(['success'=>true, 'newBalance'=>$nb]);
    } catch (Exception $e) { $db->rollBack(); out(['error'=>$e->getMessage()],400); }
}

if (preg_match('#^/withdrawals/([^/]+)/decline$#',$route,$m) && $method==='POST') {
    $s=require_session();
    if (!in_array($s['role'],['Admin','Agent','Super Admin'])) out(['error'=>'Admin only'],403);
    $b=body(); $reason=$b['reason']??'Administrative decision'; $db=getDB();
    $wq=$db->prepare("SELECT * FROM WithdrawalRequest WHERE id=?"); $wq->execute([$m[1]]); $w=$wq->fetch();
    if (!$w) out(['error'=>'Withdrawal not found'],404);
    if ($w['status'] !== 'Pending') out(['error'=>"Cannot decline: already {$w['status']}"],400);
    
    $db->prepare("UPDATE WithdrawalRequest SET status='Declined',declinedBy=?,declinedAt=?,declineReason=? WHERE id=?")
       ->execute([$s['role'].' ('.$s['username'].')',date('c'),$reason,$m[1]]);
    
    $db->prepare("INSERT INTO Notification (id,title,message,date,time,isRead,type,username) VALUES (?,?,?,?,?,0,?,?)")
       ->execute([bin2hex(random_bytes(16)),'Withdrawal Declined ❌',"Withdrawal request for {$w['goalName']} (₦".number_format($w['amount'],2).") was declined.",date('Y-m-d'),date('H:i'),'error',$w['username']]);

    out(['success'=>true]);
}

if ($route==='/categories'&&$method==='GET') { out(getDB()->query("SELECT * FROM SavingsCategory")->fetchAll()); }
if ($route==='/transactions'&&$method==='GET') { out(getDB()->query("SELECT * FROM `Transaction` ORDER BY createdAt DESC")->fetchAll()); }
if ($route==='/notifications'&&$method==='GET') {
    $s=get_session(); $db=getDB();
    if ($s && in_array($s['role'],['Admin','Agent','Super Admin'])) {
        out($db->query("SELECT * FROM Notification ORDER BY createdAt DESC")->fetchAll());
    } else if ($s) {
        $st=$db->prepare("SELECT * FROM Notification WHERE username=? ORDER BY createdAt DESC");
        $st->execute([$s['username']]); out($st->fetchAll());
    } else {
        out([]);
    }
}

// --- Get current user's fresh profile from MySQL ---
if ($route==='/users/me' && $method==='GET') {
    $s=require_session(); $db=getDB();
    $st=$db->prepare("SELECT id,fullName,username,email,phoneNumber,passportPhoto,dob,gender,address,state,lga,occupation,nextOfKinName,nextOfKinRelationship,nextOfKinPhone,bankName,accountNumber,accountName,bvn,nin,referralCode,referredBy,isKycVerified,kycStatus,twoFactorEnabled,status,role,assignedAgentUsername,createdAt FROM `User` WHERE username=?");
    $st->execute([$s['username']]); $u=$st->fetch();
    if (!$u) out(['error'=>'User not found'],404);
    $u['isKycVerified']=(bool)$u['isKycVerified']; $u['twoFactorEnabled']=(bool)$u['twoFactorEnabled'];
    out($u);
}

// --- User profile update ---
if (preg_match('#^/users/([^/]+)$#',$route,$m) && $method==='PUT') {
    $s=require_session(); $b=body(); $db=getDB();
    $target=$m[1];
    // Only admin or self can update
    if ($s['username']!==$target && !in_array($s['role'],['Admin','Super Admin'])) out(['error'=>'Unauthorized'],403);
    $fields=[]; $vals=[];
    foreach (['fullName','phoneNumber','bankName','accountNumber','accountName','address','state','lga','occupation','gender','dob','passportPhoto','status','kycStatus','isKycVerified','assignedAgentUsername'] as $f) {
        if (array_key_exists($f,$b)) { $fields[]="`$f`=?"; $vals[]=$b[$f]; }
    }
    if (!empty($b['passwordHash'])) { $fields[]="passwordHash=?"; $vals[]=password_hash($b['passwordHash'], PASSWORD_BCRYPT); }
    if (count($fields)===0) out(['error'=>'No fields to update'],400);
    $vals[]=$target;
    $db->prepare("UPDATE `User` SET ".implode(',',$fields)." WHERE username=?")->execute($vals);
    out(['success'=>true]);
}

// --- KYC approval ---
if (preg_match('#^/users/([^/]+)/kyc/approve$#',$route,$m) && $method==='POST') {
    $s=require_session();
    if (!in_array($s['role'],['Admin','Super Admin'])) out(['error'=>'Admin only'],403);
    $db=getDB();
    $db->prepare("UPDATE `User` SET kycStatus='Verified', isKycVerified=1 WHERE username=?")->execute([$m[1]]);
    $db->prepare("INSERT INTO Notification (id,title,message,date,time,isRead,type,username) VALUES (?,?,?,?,?,0,?,?)")
       ->execute([bin2hex(random_bytes(16)),'KYC Approved ✅','Your identity has been verified. Your account is now fully active.',date('Y-m-d'),date('H:i'),'success',$m[1]]);
    out(['success'=>true]);
}

// --- KYC rejection ---
if (preg_match('#^/users/([^/]+)/kyc/reject$#',$route,$m) && $method==='POST') {
    $s=require_session();
    if (!in_array($s['role'],['Admin','Super Admin'])) out(['error'=>'Admin only'],403);
    $b=body(); $reason=$b['reason']??'Documents incomplete'; $db=getDB();
    $db->prepare("UPDATE `User` SET kycStatus='Rejected', isKycVerified=0 WHERE username=?")->execute([$m[1]]);
    $db->prepare("INSERT INTO Notification (id,title,message,date,time,isRead,type,username) VALUES (?,?,?,?,?,0,?,?)")
       ->execute([bin2hex(random_bytes(16)),'KYC Rejected ❌',"Your KYC submission was rejected. Reason: $reason",date('Y-m-d'),date('H:i'),'error',$m[1]]);
    out(['success'=>true]);
}

// --- Audit logs ---
if ($route==='/audit-logs' && $method==='GET') { out([]); }
if ($route==='/audit-logs' && $method==='POST') { out(['success'=>true]); }

// --- Mark notifications read ---
if ($route==='/notifications/read-all' && $method==='PUT') {
    $s=require_session(); $db=getDB();
    $db->prepare("UPDATE Notification SET isRead=1 WHERE username=?")->execute([$s['username']]);
    out(['success'=>true]);
}

out(['error'=>"Not found: $method $route"], 404);