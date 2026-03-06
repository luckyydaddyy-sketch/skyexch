<?php

namespace App\Http\Controllers;

use App\Models\SportMatch;
use App\Models\UserAccount;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public $apiBaseUrl, $casinoBaseUrl, $skyCasinoBaseUrl, $awcApiBaseUrl;

    public function __construct()
    {
 //       $this->apiBaseUrl = 'https://trionixtech.in/api/v1';

        $this->powerPanelBaseUrl = env('API_BASE_URL') . "/api/v1";

        if(env('API_SOURCE','direct') == 'direct') {
            $this->apiBaseUrl = env('DIRECT_API_URL');
        }else {
            $this->apiBaseUrl = env('API_BASE_URL') . "/api/v1";
        }
        $this->casinoBaseUrl = env('CASINO_DIRECT_API_URL');
        $this->skyCasinoBaseUrl = env('CASINO_SKY_BASE_URL');
        $this->awcApiBaseUrl = env('AWC_API_BASE_URL');
        $this->listapiBaseUrl = env('LIST_BASE_URL');
    }

    public function getMatches($matchType){
        try {
            if($matchType == 'cricket'){
                $sportType = 4;
            }elseif($matchType == 'tennis'){
                $sportType = 2;
            }elseif($matchType == 'soccer'){
                $sportType = 1;
            }
            if(env('API_SOURCE','direct') == 'direct') {
                $response = Http::get($this->listapiBaseUrl."/getmatches/?eventType=".$sportType);
            }else {
                $response = Http::get($this->apiBaseUrl . "/matches/" . $matchType);
            }
            $result = $response->json();
            if(isset($result['data'])){
                return response()->json(['type'=>'success','data'=>$result['data']]);
            }
            return response()->json(['type'=>'success','data'=>[]]);
        }catch (\Exception $e){
            return response()->json(['type'=>'success','data'=>[]]);
        }catch (\ConnectionException $e){
            return response()->json(['type'=>'success','data'=>[]]);
        }
    }

    public function getMatchDetail($gameId,$marketId,$sportType=''){

        try {
            if(!empty($sportType)) {
                if(env('API_SOURCE','direct') == 'direct') {
                    if ($sportType == 'cricket') {
                        $sportId = 4;
                    } elseif ($sportType == 'tennis') {
                        $sportId = 2;
                    } elseif ($sportType == 'soccer') {
                        $sportId = 1;
                    }

                    $response = Http::get($this->apiBaseUrl . "/getrunners?eventType=" . $sportId . "&eventId=" . $gameId . "&marketId=" . $marketId);
                }else {
                    $response = Http::get($this->apiBaseUrl . "/match/" . $sportType . "/detail/" . $gameId . "/" . $marketId);
                }
            }else{
                if(env('API_SOURCE','direct') == 'direct') {
                    $response = Http::get($this->apiBaseUrl . "/getrunners?eventId=" . $gameId . "&marketId=" . $marketId);
                }else {
                    $match = SportMatch::select('id', 'game_id', 'match_type')->where("game_id", $gameId)->first();
                    $response = Http::get($this->apiBaseUrl . "/match/" . $match->match_type . "/detail/" . $gameId . "/" . $marketId);
                }
            }
            $result = $response->json();
            if(isset($result['data'])){
                return response()->json(['type'=>'success','data'=>$result['data']]);
            }
            return response()->json(['type'=>'success','data'=>[]]);
        }catch (\Exception $e){
            return response()->json(['type'=>'success','message'=>$e->getMessage(),'data'=>[]]);
        }catch (\ConnectionException $e){
            return response()->json(['type'=>'success','message'=>$e->getMessage(),'data'=>[]]);
        }
    }

    public function getMatchPremiumDetail($gameId,$marketId){
        try {
            if(env('API_SOURCE','direct') == 'direct') {
                $response = Http::get($this->apiBaseUrl . "/getpremiumrunners?eventId=" . $gameId . "&marketId=" . $marketId);
            }else {
                $response = Http::get($this->apiBaseUrl . "/match/premium/" . $gameId . "/" . $marketId);
            }
            $result = $response->json();
            if(isset($result['data'])){
                return response()->json(['type'=>'success','data'=>$result['data']]);
            }
            return response()->json(['type'=>'success','data'=>[]]);
        }catch (\Exception $e){
            return response()->json(['type'=>'success','data'=>[]]);
        }catch (\ConnectionException $e){
            return response()->json(['type'=>'success','data'=>[]]);
        }
    }

    public function getSkyCasinoData($casino){
        try {
            $url = $this->skyCasinoBaseUrl.":".$casino."/get_data/";
//            dd($url);
            $response = Http::get($url);
            $result = $response->json();
//            dd($result);
            if(isset($result['data'])){
                return response()->json(['type'=>'success','data'=>$result['data']]);
            }
            return response()->json(['type'=>'success','data'=>[]]);
        }catch (\Exception $e){
            return response()->json(['type'=>'success','data'=>[],'message'=>$e->getMessage()]);
        }catch (\ConnectionException $e){
            return response()->json(['type'=>'success','data'=>[],'message'=>$e->getMessage()]);
        }
    }

    public function getSkyCasinoResultsData($name,$roundId){
        try {
            $url = $this->powerPanelBaseUrl."/sky-casino/".$name."/result/".$roundId;
            $response = Http::get($url);
            $result = $response->json();
            if(isset($result['data'])){
                return response()->json(['type'=>'success','data'=>$result['data']]);
            }
            return response()->json(['type'=>'success','data'=>[]]);
        }catch (\Exception $e){
            return response()->json(['type'=>'success','data'=>[],'message'=>$e->getMessage()]);
        }catch (\ConnectionException $e){
            return response()->json(['type'=>'success','data'=>[],'message'=>$e->getMessage()]);
        }
    }

    public function getAccountStatementData($user_id, $from_date, $to_date, $report_for, $report_type){
        $query = UserAccount::where('user_id',$user_id);

        $from_date.=" 09:00:00";
        $to_date.=" 08:59:00";

        if(isset($from_date) && isset($to_date)) {
            $query->whereBetween('created_at', [$from_date, $to_date]);
        }

        if($report_for!='all'){
            if($report_for=='upper') {
                $query->where("to_user_id", $user_id);
            }else{
                $query->where("from_user_id", $user_id);
            }
        }

        if($report_type != '0'){
            if($report_type == '1'){
                $query->where('match_id',0);
            }else if($report_type == '2'){
                $query->where('match_id',"!=",0);
            }
        }

        $take = 20;

        $records = $query->orderBy('created_at', 'ASC')->paginate($take);

        $page = request()->query('page');

        $record = UserAccount::where("user_id", $user_id)->where('created_at', "<", $from_date)->orderBy('created_at', 'ASC')->first();

        $OpeningBalanceFromDate = $from_date;
        if($page > 1) {
            $skip = $page * $take - $take;
            $recordLastDate = UserAccount::where("user_id", $user_id)->orderBy('created_at', 'ASC')->skip($skip)->take(1)->first();
            if(!empty($recordLastDate)) {
                $OpeningBalanceFromDate = $recordLastDate->created_at;
            }
        }
        $openingCreditBalance = UserAccount::where("user_id", $user_id)->where('created_at', "<", $OpeningBalanceFromDate)->sum('credit_amount');
        $openingDebitBalance = UserAccount::where("user_id", $user_id)->where('created_at', "<", $OpeningBalanceFromDate)->sum('debit_amount');
        $openingCommissionAmount = UserAccount::where("user_id", $user_id)->where('created_at', "<", $OpeningBalanceFromDate)->sum('commission_amount');
        $openingBalanceDate = '';
        if (!empty($record)) {
            $openingBalanceDate = date('d-m-y H:i:s', strtotime($record->created_at));
        }

        $openingBalance = $openingCreditBalance - $openingDebitBalance - $openingCommissionAmount;

        $closing_balance = $openingBalance;

        return [
            'page' => $page,
            'records' => $records,
            'openingBalanceDate' => $openingBalanceDate,
            'openingBalance' => $openingBalance,
            'closing_balance' => $closing_balance,
        ];
    }

    public function addSportMatch($data,$is_draw){
        $resp = $this->getMatchDetail($data['game_id'],$data['market_id'],$data['match_type']);
        $result = json_decode($resp->getContent());
        $apiData = $result->data;

        $teams = [];

        if(isset($apiData->t1) && !empty($apiData->t1)){
            foreach ($apiData->t1 as $item){
                $teams[] = $item->nat;
            }
        }

        if(count($teams) <= 0) {

            $resp = $this->getMatchDetail($data['game_id'],$data['market_id'],$data['match_type']);
            $result = json_decode($resp->getContent());
            $apiData = $result->data;

            $teams = [];

            if(isset($apiData->t1) && !empty($apiData->t1)){
                foreach ($apiData->t1 as $item){
                    $teams[] = $item->nat;
                }
            }

            if(count($teams) <= 0) {
                $team = explode(" v ", $data['name']);

                foreach ($team as $item) {
                    $teams[] = trim($item);
                }
                if ($is_draw == 1) {
                    $teams[] = "The Draw";
                }
            }
        }

        $data['teams'] = $teams;
        $data['bookmaker'] = 1;

        if(!isset($data['min_bet_odds_limit'])) {
            $data['min_bet_odds_limit'] = 1;
        }
        if(!isset($data['min_bet_bookmaker_limit'])) {
            $data['min_bet_bookmaker_limit'] = 1;
        }
        if(!isset($data['min_bet_fancy_limit'])) {
            $data['min_bet_fancy_limit'] = 1;
        }
        if(!isset($data['min_bet_premium_limit'])) {
            $data['min_bet_premium_limit'] = 1;
        }

        $website = resolve('website');

        if($data['match_type'] == 'cricket'){
            $data['fancy'] = 1;
            $data['odds_limit'] = $website->default_match_limits->odds_limit;
            $data['min_bet_odds_limit'] = $website->default_match_limits->min_bet_odds_limit;
            $data['max_bet_odds_limit'] = $website->default_match_limits->max_bet_odds_limit;
            $data['min_bet_bookmaker_limit'] = $website->default_match_limits->min_bookmaker_limit;
            $data['max_bet_bookmaker_limit'] = $website->default_match_limits->max_bookmaker_limit;
            $data['min_bet_fancy_limit'] = $website->default_match_limits->min_fancy_limit;
            $data['max_bet_fancy_limit'] = $website->default_match_limits->max_fancy_limit;
            $data['min_bet_premium_limit'] = $website->default_match_limits->premium_min_bet_odds_limit;
            $data['max_bet_premium_limit'] = $website->default_match_limits->premium_max_bet_odds_limit;
        }elseif($data['match_type'] == 'tennis'){
            $data['odds_limit'] = $website->default_match_limits->tennis_odds_limit;
            $data['min_bet_odds_limit'] = $website->default_match_limits->tennis_min_bet_odds_limit;
            $data['max_bet_odds_limit'] = $website->default_match_limits->tennis_max_bet_odds_limit;
            $data['min_bet_bookmaker_limit'] = $website->default_match_limits->tennis_min_bet_bookmaker_limit;
            $data['max_bet_bookmaker_limit'] = $website->default_match_limits->tennis_max_bet_bookmaker_limit;
            $data['max_bet_fancy_limit'] = 0;
            $data['min_bet_premium_limit'] = $website->default_match_limits->tennis_premium_min_bet_odds_limit;
            $data['max_bet_premium_limit'] = $website->default_match_limits->tennis_premium_max_bet_odds_limit;
        }elseif($data['match_type'] == 'soccer'){
            $data['odds_limit'] = $website->default_match_limits->soccer_odds_limit;
            $data['min_bet_odds_limit'] = $website->default_match_limits->soccer_min_bet_odds_limit;
            $data['max_bet_odds_limit'] = $website->default_match_limits->soccer_max_bet_odds_limit;
            $data['min_bet_bookmaker_limit'] = $website->default_match_limits->soccer_min_bet_bookmaker_limit;
            $data['max_bet_bookmaker_limit'] = $website->default_match_limits->soccer_max_bet_bookmaker_limit;
            $data['max_bet_fancy_limit'] = 0;
            $data['min_bet_premium_limit'] = $website->default_match_limits->soccer_premium_min_bet_odds_limit;
            $data['max_bet_premium_limit'] = $website->default_match_limits->soccer_premium_max_bet_odds_limit;
        }

        return SportMatch::create($data);
    }

    public function getMultiExchCasinoApiKeys($name){
        $array =  [
            'Lucky7' => 'lucky7',
            'Lucky7B' => 'lucky7eu',
            'DragonTiger' => 'dt20',
            'DragonTigerB' => 'dt202',
            'AAA' => 'aaa',
            'AndarBaharB' => 'abj',
            'TeenPatiT20' => 'teen20',
            'Cards32' => 'card32',
            'Cards32B' => 'card32eu',
            'Poker20' => 'poker20',
            'Bollywood' => 'btable',
            'TeenPatiOneDay' => 'teen',
        ];

        if(isset($array[$name])) {
            return $array[$name];
        }

        return "";
    }

    public function getCasinoDetailDataFromApi($name){

        if(env('CASINO_DIRECT_API_SOURCE') == 'multiexch'){

            $convertName = $this->getMultiExchCasinoApiKeys($name);
//            dd($this->casinoBaseUrl . "/api/d_rate/" . $convertName);

            $response = Http::get($this->casinoBaseUrl . "/api/d_rate/" . $convertName);
            $result = $response->json();

            $response1 = Http::get($this->casinoBaseUrl . "/api/l_result/" . $convertName);
            $result1 = $response1->json();
        }else {
            $response = Http::post($this->casinoBaseUrl . "/casino/" . $name);
            $result = $response->json();

            $response1 = Http::post($this->casinoBaseUrl . "/casino/" . $name . "Result");
            $result1 = $response1->json();
        }
        $results = [];
        if(isset($result1['data'])){
            $results = $result1['data'];
        }

        $data = [];
        if(isset($result['data'])){
            $data = $result['data'];
        }elseif(isset($result['t1'])){
            $data = $result;
        }

        return response()->json(['type'=>'success','data'=>$data,'results'=>$results]);
    }

    public function callAWCApi($action,$method,$data = []){
        if($method == "POST"){

            //dd($this->awcApiBaseUrl . $action, $data);
            //$response1 = Http::asForm()->post($this->awcApiBaseUrl . $action, http_build_query($data));

            $curl = curl_init();

            curl_setopt_array($curl, array(
            CURLOPT_URL => $this->awcApiBaseUrl . $action,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => http_build_query($data),
            CURLOPT_HTTPHEADER => array(
                "cache-control: no-cache",
                "content-type: application/x-www-form-urlencoded"
            ),
            ));

            $response = curl_exec($curl);
            $err = curl_error($curl);

            curl_close($curl);

            return json_decode($response,true);

            //dd(json($response));

        }else{
            $response1 = Http::asForm()->get($this->awcApiBaseUrl . $action);
        }
        return $response1->json();
    }
}
