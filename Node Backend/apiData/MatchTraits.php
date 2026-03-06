<?php
namespace App\Traits;

use App\Models\AwcCasinoBet;
use App\Models\Bet;
use App\Models\CasinoBet;
use App\Models\User;
use App\Models\UserAccount;
use Illuminate\Support\Facades\Log;

trait MatchTraits
{
    public function getSessionExposer($userId, $matchId=0, $fancyName='', $conditionalParameters = [])
    {

        $query = Bet::where('user_id', $userId)->where('bet_type', 'SESSION')->where('deleted', 0)->where('result_declare', 0);

        if($matchId!=0) {
            if(isset($conditionalParameters['match_id'])){
                $query->where('match_id', $conditionalParameters['match_id'], $matchId);
            }else{
                $query->where('match_id', $matchId);
            }
        }
        if(!empty($fancyName)) {
            if(isset($conditionalParameters['selection'])){
                $query->where('selection', $conditionalParameters['selection'], $fancyName);
            }else {
                $query->where('selection', $fancyName);
            }
        }

        $my_placed_bets = $query->orderBy('created_at', 'asc')->get();

        $new_obj = array();
        $i = 0;
        foreach ($my_placed_bets as $bet) {
            $new_obj[$i]['user_id'] = $bet->user_id;
            $new_obj[$i]['match_id'] = $bet->match_id;
            $new_obj[$i]['bet_type'] = $bet->bet_type;
            $new_obj[$i]['bet_side'] = $bet->bet_side;
            $new_obj[$i]['odds'] = $bet->odds;
            $new_obj[$i]['odds_volume'] = $bet->odds_volume;
            $new_obj[$i]['amount'] = $bet->amount;
            $new_obj[$i]['profit'] = $bet->profit;
            $new_obj[$i]['selection'] = $bet->selection;
            $new_obj[$i]['exposer'] = $bet->exposer;
            $i++;
        }

        $exposer=0; $odds=0; $odds_volume=0;  $bet_side='';
        if(isset($conditionalParameters['exposer'])){
            $exposer = $conditionalParameters['exposer'];
        }
        if(isset($conditionalParameters['odds'])){
            $odds = $conditionalParameters['odds'];
        }
        if(isset($conditionalParameters['odds_volume'])){
            $odds_volume = $conditionalParameters['odds_volume'];
        }
        if(isset($conditionalParameters['bet_side'])){
            $bet_side = $conditionalParameters['bet_side'];
        }

        if(!empty($bet_side)) {
            $new_obj[$i]['user_id'] = $userId;
            $new_obj[$i]['match_id'] = $matchId;
            $new_obj[$i]['bet_type'] = 'SESSION';
            $new_obj[$i]['bet_side'] = $bet_side;
            $new_obj[$i]['odds'] = $odds;
            $new_obj[$i]['odds_volume'] = $odds_volume;
            $new_obj[$i]['amount'] = $exposer;
            $new_obj[$i]['profit'] = $exposer;
            $new_obj[$i]['selection'] = $fancyName;
            $new_obj[$i]['exposer'] = $exposer;
        }

        $final_exposer = 0;
        if (!empty($new_obj)) {
            $run_arr = array();

            for ($i = 0; $i < count($new_obj); $i++) {
                $down_position = $new_obj[$i]['odds_volume'] - 1;
                if (!in_array($down_position, $run_arr)) {
                    $run_arr[] = $down_position;
                }
                $level_position = $new_obj[$i]['odds_volume'];
                if (!in_array($level_position, $run_arr)) {
                    $run_arr[] = $level_position;
                }
                $up_position = $new_obj[$i]['odds_volume'] + 1;
                if (!in_array($up_position, $run_arr)) {
                    $run_arr[] = $up_position;
                }
            }
            array_unique($run_arr);
            sort($run_arr);

            $min_val = min($run_arr);
            $max_val = max($run_arr);

            $newArr = array();

            for ($i = 0; $i <= $max_val + 1000; ++$i) {
                $new = $i;
                $newArr[] = $new;
            }

            $run_arr = array();
            $run_arr = $newArr;

            $bet_chk = '';
            $bet_model = '';
            $final_exposer = 0;

            for ($kk = 0; $kk < sizeof($run_arr); $kk++) {
                $bet_deduct_amt = 0;
                $placed_bet_type = '';
                //foreach($my_placed_bets as $bet)
                for ($i = 0; $i < count($new_obj); $i++) {
                    if ($new_obj[$i]['bet_side'] == 'BACK') {
                        if ($new_obj[$i]['odds_volume'] == $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt + $new_obj[$i]['profit'];
                        } else if ($new_obj[$i]['odds_volume'] < $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt + $new_obj[$i]['profit'];
                        } else if ($new_obj[$i]['odds_volume'] > $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt - $new_obj[$i]['exposer'];
                        }
                    } else if ($new_obj[$i]['bet_side'] == 'LAY') {
                        if ($new_obj[$i]['odds_volume'] == $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt - $new_obj[$i]['exposer'];
                        } else if ($new_obj[$i]['odds_volume'] < $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt - $new_obj[$i]['exposer'];
                        } else if ($new_obj[$i]['odds_volume'] > $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt + $new_obj[$i]['amount'];
                        }
                    }
                }
                if ($final_exposer == "")
                    $final_exposer = $bet_deduct_amt;
                else {
                    if ($final_exposer > $bet_deduct_amt)
                        $final_exposer = $bet_deduct_amt;
                }

            }
        }

        return abs($final_exposer);
    }

    public function getAllSessionExposure($userId, $matchId=0, $fancyName='', $conditionalParameters = [])
    {

        $query = Bet::where('bet_type', 'SESSION')->where('deleted', 0)->where('result_declare', 0);

        if(is_array($userId)){
            $query->whereIn('user_id', $userId);
        }else{
            $query->where('user_id', $userId);
        }

        if($matchId!=0) {
            if(isset($conditionalParameters['match_id'])){
                $query->where('match_id', $conditionalParameters['match_id'], $matchId);
            }else{
                $query->where('match_id', $matchId);
            }
        }
        if(!empty($fancyName)) {
            if(isset($conditionalParameters['selection'])){
                $query->where('selection', $conditionalParameters['selection'], $fancyName);
            }else {
                $query->where('selection', $fancyName);
            }
        }

        $my_placed_bets = $query->orderBy('created_at', 'asc')->get();

        $calculated_expo = 0;
        $abc = sizeof($my_placed_bets);
        $return_final_exposure = '';
        $profit_loss = "";
        $return_exposure = 0;
        $expo_array = array();

        $new_obj = array();
        $i = 0;
        foreach ($my_placed_bets as $bet) {
            $new_obj[$i]['user_id'] = $bet->user_id;
            $new_obj[$i]['match_id'] = $bet->match_id;
            $new_obj[$i]['bet_type'] = $bet->bet_type;
            $new_obj[$i]['bet_side'] = $bet->bet_side;
            $new_obj[$i]['odds'] = $bet->odds;
            $new_obj[$i]['odds_volume'] = $bet->odds_volume;
            $new_obj[$i]['amount'] = $bet->amount;
            $new_obj[$i]['profit'] = $bet->profit;
            $new_obj[$i]['selection'] = $bet->selection;
            $new_obj[$i]['exposer'] = $bet->exposer;
            $i++;
        }

        $exposer=0; $odds=0; $odds_volume=0;  $bet_side='';
        if(isset($conditionalParameters['exposer'])){
            $exposer = $conditionalParameters['exposer'];
        }
        if(isset($conditionalParameters['odds'])){
            $odds = $conditionalParameters['odds'];
        }
        if(isset($conditionalParameters['odds_volume'])){
            $odds_volume = $conditionalParameters['odds_volume'];
        }
        if(isset($conditionalParameters['bet_side'])){
            $bet_side = $conditionalParameters['bet_side'];
        }

        if(!empty($bet_side)) {
            $new_obj[$i]['user_id'] = $userId;
            $new_obj[$i]['match_id'] = $matchId;
            $new_obj[$i]['bet_type'] = 'SESSION';
            $new_obj[$i]['bet_side'] = $bet_side;
            $new_obj[$i]['odds'] = $odds;
            $new_obj[$i]['odds_volume'] = $odds_volume;
            $new_obj[$i]['amount'] = $exposer;
            $new_obj[$i]['profit'] = $exposer;
            $new_obj[$i]['selection'] = $fancyName;
            $new_obj[$i]['exposer'] = $exposer;
        }

        if (sizeof($new_obj) > 0) {
            $run_arr = array();

            for ($i = 0; $i < count($new_obj); $i++) {
                $down_position = $new_obj[$i]['odds'] - 1;
                if (!in_array($down_position, $run_arr)) {
                    $run_arr[] = $down_position;
                }
                $level_position = $new_obj[$i]['odds'];
                if (!in_array($level_position, $run_arr)) {
                    $run_arr[] = $level_position;
                }
                $up_position = $new_obj[$i]['odds'] + 1;
                if (!in_array($up_position, $run_arr)) {
                    $run_arr[] = $up_position;
                }
            }
            array_unique($run_arr);
            sort($run_arr);

            $min_val = min($run_arr);
            $max_val = max($run_arr);

            $newArr = array();

            for ($i = 0; $i <= $max_val + 1000; ++$i) {
                $new = $i;
                $newArr[] = $new;
            }

            $run_arr = array();
            $run_arr = $newArr;

            $bet_chk = '';
            $bet_model = '';
            $final_exposer = '';

            for ($kk = 0; $kk < sizeof($run_arr); $kk++) {
                $bet_deduct_amt = 0;
                $placed_bet_type = '';
                //foreach($my_placed_bets as $bet)
                for ($i = 0; $i < count($new_obj); $i++) {
                    if ($new_obj[$i]['bet_side'] == 'BACK') {
                        if ($new_obj[$i]['odds'] == $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt + $new_obj[$i]['profit'];
                        } else if ($new_obj[$i]['odds'] < $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt + $new_obj[$i]['profit'];
                        } else if ($new_obj[$i]['odds'] > $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt - $new_obj[$i]['exposer'];
                        }
                    } else if ($new_obj[$i]['bet_side'] == 'LAY') {
                        if ($new_obj[$i]['odds'] == $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt - $new_obj[$i]['exposer'];
                        } else if ($new_obj[$i]['odds'] < $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt - $new_obj[$i]['exposer'];
                        } else if ($new_obj[$i]['odds'] > $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt + $new_obj[$i]['amount'];
                        }
                    }
                }
                if ($final_exposer == "")
                    $final_exposer = $bet_deduct_amt;
                else {
                    if ($final_exposer > $bet_deduct_amt)
                        $final_exposer = $bet_deduct_amt;
                }

            }
            $calculated_expo = $calculated_expo + abs($final_exposer);
        }
        return abs($calculated_expo);

    }

    public function getUserAllMatchFancyExposer($userId,$matchId=0){

        $query = Bet::where('bet_type', 'SESSION')->where('deleted', 0)->where('result_declare', 0);

        if(is_array($userId)){
            $query->whereIn('user_id', $userId);
        }else{
            $query->where('user_id', $userId);
        }

        if($matchId!=0) {
            if(isset($conditionalParameters['match_id'])){
                $query->where('match_id', $conditionalParameters['match_id'], $matchId);
            }else{
                $query->where('match_id', $matchId);
            }
        }


        $my_placed_bets = $query->groupby('selection', 'match_id')->orderBy('created_at', 'asc')->get();

        $fancyArray = [];
        $total_fancy_expo = 0;
        foreach ($my_placed_bets as $bet) {
            $sessionExposer = $this->getAllSessionExposure($userId, $bet->match_id, $bet->selection);
            $total_fancy_expo = $total_fancy_expo + $sessionExposer;
            $fancyArray[$bet->selection_sid] = $sessionExposer;
        }

        $fancyArray['total'] = $total_fancy_expo;

        return $fancyArray;
    }

    public function getUserExposer($userId){

        $oddsBookmakerExposerArr = $this->getOddsAndBookmakerExposer($userId);
        $oddsExposer = $oddsBookmakerExposerArr['exposer'];
        $sessionExposerArray = $this->getUserAllMatchFancyExposer($userId);
        $sessionExposer = $sessionExposerArray['total'];

        $casinoExposerArray = $this->getCasinoExAmount($userId);
        $casinoExposer = $casinoExposerArray['exposer'];

        $awcCasinoExposer = $this->getAwcCasinoExAmount($userId);

        return array_sum([$oddsExposer, $sessionExposer, $casinoExposer, $awcCasinoExposer]);
    }

    public function SaveBalance($userId)
    {
        $exposer = $this->getUserExposer($userId);
        $user = User::find($userId);

        if($user->remaining_balance < $exposer || $exposer < 0){
            return false;
        }

        User::where("id",$userId)->update(['exposer' => $exposer,'available_balance'=>($user->remaining_balance-$exposer)]);
        return $exposer;
    }

    public function getExAmountForOdds($userID = '', $matchId = '')
    {
        $query = Bet::where("result_declare",0)->where("deleted",0);

        if(!empty($userID) && $userID > 0){
            if(is_array($userID)){
                $query->whereIn("user_id", $userID);
            }else {
                $query->where("user_id", $userID);
            }
        }
        if(!empty($matchId) && $matchId > 0){
            $query->where("match_id",$matchId);
        }

        $bets = $query->orderby('id', 'DESC')->get();

        $response = array();
        $arr = array();
        foreach ($bets as $key => $bet) {
            $extra = json_decode($bet->teams, true);

            if ($bet['bet_side'] == 'LAY') {
                $profitAmt = ($bet['exposer'] * (-1));
                $bet_amt = $bet['amount'];
            }
            else {
                $profitAmt = $bet['profit']; ////nnn
                $bet_amt = ($bet['amount'] * (-1));
            }

            switch ($bet['bet_type']) {
                case "ODDS":
                {
                    foreach ($extra as $teamName){
                        if($teamName == $bet['selection']) {
                            if (!isset($response['ODDS'][$teamName])) {
                                $response['ODDS'][$teamName] = round($profitAmt, 2);
                            } else {
                                $response['ODDS'][$teamName] += round($profitAmt, 2);
                            }
                        }else {
                            if (!isset($response['ODDS'][$teamName])) {
                                $response['ODDS'][$teamName] = round($bet_amt, 2);
                            } else {
                                $response['ODDS'][$teamName] += round($bet_amt, 2);
                            }
                        }
                    }
                    break;
                }
                case 'BOOKMAKER':
                {
                    foreach ($extra as $teamName){
                        if($teamName == $bet['selection']) {
                            if (!isset($response['BOOKMAKER'][$teamName])) {
                                $response['BOOKMAKER'][$teamName] = round($profitAmt, 2);
                            } else {
                                $response['BOOKMAKER'][$teamName] += round($profitAmt, 2);
                            }
                        }else {
                            if (!isset($response['BOOKMAKER'][$teamName])) {
                                $response['BOOKMAKER'][$teamName] = round($bet_amt, 2);
                            } else {
                                $response['BOOKMAKER'][$teamName] += round($bet_amt, 2);
                            }
                        }
                    }
                    break;
                }
                case 'PREMIUM':
                {
                    foreach ($extra as $teamName){
                        if($teamName == $bet['selection']) {
                            if (!isset($response['PREMIUM'][$bet['market_id']][$teamName])) {
                                $response['PREMIUM'][$bet['market_id']][$teamName] = round($profitAmt, 2);
                            } else {
                                $response['PREMIUM'][$bet['market_id']][$teamName] += round($profitAmt, 2);
                            }
                        }else {
                            if (!isset($response['PREMIUM'][$bet['market_id']][$teamName])) {
                                $response['PREMIUM'][$bet['market_id']][$teamName] = round($bet_amt, 2);
                            } else {
                                $response['PREMIUM'][$bet['market_id']][$teamName] += round($bet_amt, 2);
                            }
                        }
                    }
                    break;
                }
            }
        }
        return $response;
    }

    public function getOddsAndBookmakerExposer($userId='',$matchId=0,$conditionalParameters = []){
        $query = Bet::select('bets.id','bets.match_id','bets.created_at', 'sport_matches.*')->join('sport_matches', 'sport_matches.id', '=', 'bets.match_id')
            ->where('bets.result_declare', 0)
            ->where('bets.deleted', 0)
            ->whereNull('sport_matches.winner')
            ->where('bets.bet_type', '!=', 'SESSION')
            ->orderBy('bets.id', 'Desc')
            ->groupby('bets.match_id');

        if(!empty($userId)){
            if(is_array($userId)){
                $query->whereIn('bets.user_id', $userId);
            }else {
                $query->where('bets.user_id', $userId);
            }
        }

        if($matchId!=0){
            if(isset($conditionalParameters['match_id'])){
                $query->where("bets.match_id",$conditionalParameters['match_id'], $matchId);
            }else {
                $query->where("bets.match_id", $matchId);
            }
        }

        $sportsModel = $query->get();

        $exposerArray = [
            'exposer' => 0
        ];

        foreach ($sportsModel as $bet) {
            $exAmtArr = $this->getExAmountForOdds($userId, $bet->match_id);

            if (isset($exAmtArr['ODDS'])) {
                $arr = array();
                foreach ($exAmtArr['ODDS'] as $key => $profitLos) {
                    if ($profitLos < 0) {
                        $arr[abs($profitLos)] = abs($profitLos);
                    }
                }
                if (is_array($arr) && count($arr) > 0) {
                    $exposerArray['exposer'] += max($arr);
                }

                $exposerArray['ODDS'] = $exAmtArr['ODDS'];
            }

            if (isset($exAmtArr['BOOKMAKER'])) {
                $arrB = array();
                foreach ($exAmtArr['BOOKMAKER'] as $key => $profitLos) {
                    if ($profitLos < 0) {
                        $arrB[abs($profitLos)] = abs($profitLos);
                    }
                }

                $exposerArray['BOOKMAKER'] = $exAmtArr['BOOKMAKER'];

                if (is_array($arrB) && count($arrB) > 0) {
                    $exposerArray['exposer'] += max($arrB);
                }
            }

            if (isset($exAmtArr['PREMIUM'])) {

                foreach ($exAmtArr['PREMIUM'] as $marketName => $teams) {
                    $arrB = array();
                    foreach ($teams as $key => $profitLos) {
                        if ($profitLos < 0) {
                            $arrB[abs($profitLos)] = abs($profitLos);
                        }
                    }
                    if (is_array($arrB) && count($arrB) > 0) {
                        $exposerArray['exposer'] += max($arrB);
                    }
                }

                $exposerArray['PREMIUM'] = $exAmtArr['PREMIUM'];
            }
        }

        if(isset($conditionalParameters['bet_type'])){
            $response = $this->getOddsAndBookmakerExposer($userId,$matchId);

            $bet = [];
            $bet['bet_type'] = $conditionalParameters['bet_type'];
            $bet['bet_side'] = $conditionalParameters['bet_side'];
            $bet['selection'] = $conditionalParameters['selection'];
            $bet['exposer'] = $conditionalParameters['exposer'];
            $bet['amount'] = $conditionalParameters['amount'];
            $bet['profit'] = $conditionalParameters['profit'];
            if(isset($conditionalParameters['market_name'])) {
                $bet['market_name'] = $conditionalParameters['market_name'];
            }
            if(isset($conditionalParameters['market_id'])) {
                $bet['market_id'] = $conditionalParameters['market_id'];
            }
            $extra = json_decode($conditionalParameters['extra'], true);

            if ($bet['bet_side'] == 'LAY') {
                $profitAmt = ($bet['exposer'] * (-1));
                $bet_amt = $bet['amount'];
            }
            else {
                $profitAmt = $bet['profit']; ////nnn
                $bet_amt = ($bet['amount'] * (-1));
            }

            switch ($bet['bet_type']) {
                case "ODDS":
                {
                    foreach ($extra as $teamName){
                        if($teamName == $bet['selection']) {
                            if (!isset($response['ODDS'][$teamName])) {
                                $response['ODDS'][$teamName] = round($profitAmt, 2);
                            } else {
                                $response['ODDS'][$teamName] += round($profitAmt, 2);
                            }
                        }else {
                            if (!isset($response['ODDS'][$teamName])) {
                                $response['ODDS'][$teamName] = round($bet_amt, 2);
                            } else {
                                $response['ODDS'][$teamName] += round($bet_amt, 2);
                            }
                        }
                    }
                    break;
                }
                case 'BOOKMAKER':
                {
                    foreach ($extra as $teamName){
                        if($teamName == $bet['selection']) {
                            if (!isset($response['BOOKMAKER'][$teamName])) {
                                $response['BOOKMAKER'][$teamName] = round($profitAmt, 2);
                            } else {
                                $response['BOOKMAKER'][$teamName] += round($profitAmt, 2);
                            }
                        }else {
                            if (!isset($response['ODDS'][$teamName])) {
                                $response['ODDS'][$teamName] = round($bet_amt, 2);
                            } else {
                                $response['ODDS'][$teamName] += round($bet_amt, 2);
                            }
                        }
                    }
                    break;
                }
                case 'PREMIUM':
                {
                    foreach ($extra as $teamName){
                        if($teamName == $bet['selection']) {
                            if (!isset($response['PREMIUM'][$bet['market_id']][$teamName])) {
                                $response['PREMIUM'][$bet['market_id']][$teamName] = round($profitAmt, 2);
                            } else {
                                $response['PREMIUM'][$bet['market_id']][$teamName] += round($profitAmt, 2);
                            }
                        }else {
                            if (!isset($response['PREMIUM'][$bet['market_id']][$teamName])) {
                                $response['PREMIUM'][$bet['market_id']][$teamName] = round($bet_amt, 2);
                            } else {
                                $response['PREMIUM'][$bet['market_id']][$teamName] += round($bet_amt, 2);
                            }
                        }
                    }
                    break;
                }
            }

            if(isset($response['ODDS'])) {
                $arr = array();
                foreach ($response['ODDS'] as $key => $profitLos) {
                    if ($profitLos < 0) {
                        $arr[abs($profitLos)] = abs($profitLos);
                    }
                }

                $newExpAmount = 0;
                if (is_array($arr) && count($arr) > 0) {
                    $newExpAmount = max($arr);
                }
                $exposerArray['exposer'] += $newExpAmount;
                $exposerArray['ODDS'] = $response['ODDS'];
            }

            if(isset($response['BOOKMAKER'])) {
                $arrB = array();
                foreach ($response['BOOKMAKER'] as $key => $profitLos) {
                    if ($profitLos < 0) {
                        $arrB[abs($profitLos)] = abs($profitLos);
                    }
                }
                $newExpAmount1 = 0;
                if (is_array($arrB) && count($arrB) > 0) {
                    $newExpAmount1 += max($arrB);
                }
                $exposerArray['exposer'] += $newExpAmount1;
                $exposerArray['BOOKMAKER'] = $response['BOOKMAKER'];
            }

            if(isset($response['PREMIUM'])) {
                foreach ($response['PREMIUM'] as $marketName => $teams) {
                    $arrC = array();
                    foreach ($teams as $key => $profitLos) {
                        if ($profitLos < 0) {
                            $arrC[abs($profitLos)] = abs($profitLos);
                        }
                    }

                    $newExpAmount2 = 0;
                    if (is_array($arrC) && count($arrC) > 0) {
                        $newExpAmount2 += max($arrC);
                    }
                    $exposerArray['exposer'] += $newExpAmount2;
                }
                $exposerArray['PREMIUM'] = $response['PREMIUM'];
            }
        }
        return $exposerArray;
    }

    public function getFancyExposer($userId, $matchId){

        $query = Bet::where('result_declare', 0)
            ->where('deleted', 0)
            ->where('match_id', $matchId)
            ->where('bet_type', 'SESSION');

        if(is_array($userId)){
            $query->whereIn('user_id', $userId);
        }else{
            $query->where('user_id', $userId);
        }

        $bets = $query->orderBy('id', 'Desc')->groupby('selection_sid')->get();

        $bet_total = [];

        if ($bets->count() > 0) {
            foreach ($bets as $item) {

                $final_exposer = 0;

                $sIdBetsQuery = Bet::where('result_declare', 0)
                    ->where('deleted', 0)
                    ->where('match_id', $matchId)
                    ->where('selection_sid', $item->selection_sid)
                    ->where('bet_type', 'SESSION');

                if(is_array($userId)){
                    $sIdBetsQuery->whereIn('user_id', $userId);
                }else{
                    $sIdBetsQuery->where('user_id', $userId);
                }

                $sIdBets = $sIdBetsQuery->orderBy('id', 'Desc')->get();

                $run_arr = array();
                foreach ($sIdBets as $bet) {
                    $down_position = $bet->odds_volume - 1;
                    if (!in_array($down_position, $run_arr)) {
                        $run_arr[] = $down_position;
                    }
                    $level_position = $bet->odds_volume;
                    if (!in_array($level_position, $run_arr)) {
                        $run_arr[] = $level_position;
                    }
                    $up_position = $bet->odds_volume + 1;
                    if (!in_array($up_position, $run_arr)) {
                        $run_arr[] = $up_position;
                    }
                }
                array_unique($run_arr);
                sort($run_arr);

                $min_val = min($run_arr);
                $max_val = max($run_arr);

                $newArr = array();

                for ($z = $min_val; $z <= $max_val; ++$z) {
                    $new = $z;
                    $newArr[] = $new;
                }

                $run_arr = array();
                $run_arr = $newArr;

                for ($kk = 0; $kk < sizeof($run_arr); $kk++) {
                    $bet_deduct_amt = 0;
                    foreach ($sIdBets as $bet) {
                        if ($bet->bet_side == 'BACK') {
                            if ($bet->odds_volume == $run_arr[$kk]) {
                                $bet_deduct_amt = $bet_deduct_amt + $bet->profit;
                            } else if ($bet->odds_volume < $run_arr[$kk]) {
                                $bet_deduct_amt = $bet_deduct_amt + $bet->profit;
                            } else if ($bet->odds_volume > $run_arr[$kk]) {
                                $bet_deduct_amt = $bet_deduct_amt - $bet->exposer;
                            }
                        } else if ($bet->bet_side == 'LAY') {
                            if ($bet->odds_volume == $run_arr[$kk]) {
                                $bet_deduct_amt = $bet_deduct_amt - $bet->exposer;
                            } else if ($bet->odds_volume < $run_arr[$kk]) {
                                $bet_deduct_amt = $bet_deduct_amt - $bet->exposer;
                            } else if ($bet->odds_volume > $run_arr[$kk]) {
                                $bet_deduct_amt = $bet_deduct_amt + $bet->amount;
                            }
                        }
                    }
                    if ($final_exposer == "")
                        $final_exposer = $bet_deduct_amt;
                    else {
                        if ($final_exposer > $bet_deduct_amt) {
                            $final_exposer = $bet_deduct_amt;
                        }
                    }
                }

                $bet_total[$item->selection_sid] = round(abs($final_exposer), 2);
            }
        }


        return $bet_total;
    }

    public function getBetReportHtml($user_id, $id){
        $statement = UserAccount::where("id",$id)->first();
        if(empty($statement)){
            return response()->json(['type'=>'error','message'=>'Unauthorised request!']);
        }

        if($statement->match_type == 'casino'){
            $query = CasinoBet::where("casino_id", $statement->match_id)->where("user_id", $user_id)->where('deleted', 0)->where("round_id", $statement->bet_market_id);
        }elseif($statement->match_type == 'awc-casino'){
            $query = AwcCasinoBet::where("id", $statement->match_id)->where("user_id", $user_id)->where('deleted', 0);
        }else {
            $query = Bet::where("match_id", $statement->match_id)->where("user_id", $user_id)->where('deleted', 0)->where("bet_type", $statement->bet_type);

            if ($statement->bet_type == 'PREMIUM') {
                $query->where("market_id", $statement->bet_market_id);
            }
            if ($statement->bet_type == 'SESSION') {
                $query->where("selection", $statement->bet_selection);
            }
        }

        $bets = $query->get();

        $html = view('bet-report-list',compact('bets','statement'))->render();

        return response()->json(['type'=>'success','message'=>'Results','data'=>['html'=>$html]]);
    }

    public function getSessionCalculation($userId,$selectionSid,$matchId=0){
        $query = Bet::where('selection_sid', $selectionSid)->where('bet_type', 'SESSION')->where('deleted', 0)->where('result_declare', 0);

        if(is_array($userId)){
            $query->whereIn('user_id', $userId);
        }else{
            $query->where('user_id', $userId);
        }

        if($matchId!=0) {
            $query->where('match_id', $matchId);
        }

        $my_placed_bets = $query->orderBy('created_at', 'asc')->get();

        $final_exposer = 0;
        $position = '';
        if (!empty($my_placed_bets) && $my_placed_bets->count() > 0) {
            $run_arr = array();
            foreach ($my_placed_bets as $bet) {
                $down_position = $bet->odds - 1;
                if (!in_array($down_position, $run_arr)) {
                    $run_arr[] = $down_position;
                }
                $level_position = $bet->odds;
                if (!in_array($level_position, $run_arr)) {
                    $run_arr[] = $level_position;
                }
                $up_position = $bet->odds + 1;
                if (!in_array($up_position, $run_arr)) {
                    $run_arr[] = $up_position;
                }
            }
            array_unique($run_arr);
            sort($run_arr);

            $min_val = min($run_arr);
            $max_val = max($run_arr);

            $newArr = array();

            for ($z = $min_val; $z <= $max_val; ++$z) {
                $new = $z;
                $newArr[] = $new;
            }

            $run_arr = array();
            $run_arr = $newArr;

            for ($kk = 0; $kk < sizeof($run_arr); $kk++) {
                $bet_deduct_amt = 0;
                $placed_bet_type = '';
                foreach ($my_placed_bets as $bet) {
                    if ($bet->bet_side == 'BACK') {
                        if ($bet->odds == $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt + $bet->profit;
                        } else if ($bet->odds < $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt + $bet->profit;
                        } else if ($bet->odds > $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt - $bet->exposer;
                        }
                    } else if ($bet->bet_side == 'LAY')
                    {
                        if ($bet->odds == $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt - $bet->exposer;
                        } else if ($bet->odds < $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt - $bet->exposer;
                        } else if ($bet->odds > $run_arr[$kk]) {
                            $bet_deduct_amt = $bet_deduct_amt + $bet->amount;
                        }
                    }
                }
                if ($final_exposer == "")
                    $final_exposer = $bet_deduct_amt;
                else {
                    if ($final_exposer > $bet_deduct_amt)
                        $final_exposer = $bet_deduct_amt;
                }

                if ($bet_deduct_amt > 0) {
                    $position .= '<tr>
										<td class="text-center cyan-bg">' . $run_arr[$kk] . '</td>
										<td class="text-right cyan-bg">' . $bet_deduct_amt . '</td>
										</tr>';
                } else {
                    $position .= '<tr>
										<td class="text-center pink-bg">' . $run_arr[$kk] . '</td>
										<td class="text-right pink-bg">' . $bet_deduct_amt . '</td>
										</tr>';
                }
            }
        }

        return array('status'=> true,'action'=>'success','html'=>$position);
    }

    public static function getExAmountCasinoForEachTeam($id, $casino_id='',$roundId=''){
        if(empty($roundId)) {
            $casinoBets = CasinoBet::where("casino_id", $casino_id)->where('user_id', $id)->where('deleted',0)->whereNull('winner')->get();
        }else{
            $casinoBets = CasinoBet::where("casino_id", $casino_id)->where('user_id', $id)->where('deleted',0)->where('round_id', $roundId)->whereNull('winner')->get();
        }
        $response = array();
        $arr = array();
        foreach ($casinoBets as $bet) {
            $extra = json_decode($bet->teams, true);

            if ($bet['bet_side'] == 'LAY') {
                $profitAmt = ($bet['exposer'] * (-1));
                $bet_amt = $bet['amount'];
            }
            else {
                $profitAmt = $bet['profit'];
                $bet_amt = ($bet['amount'] * (-1));
            }

            foreach ($extra as $team){
                if($team['sid'] == $bet['selection_sid']) {
                    if (!isset($response['ODDS'][$team['sid']])) {
                        $response['ODDS'][$team['sid']] = round($profitAmt, 2);
                    } else {
                        $response['ODDS'][$team['sid']] += round($profitAmt, 2);
                    }
                }else {
                    if (!isset($response['ODDS'][$team['sid']])) {
                        $response['ODDS'][$team['sid']] = round($bet_amt, 2);
                    } else {
                        $response['ODDS'][$team['sid']] += round($bet_amt, 2);
                    }
                }
            }
        }

        return $response;
    }

    public static function getCasinoExAmount($userId,$casino_id = '',$roundId='',$casinoNameCondition=[])
    {

        $query = CasinoBet::query();

        if(is_array($userId)){
            $query->whereIn('user_id', $userId);
        }else{
            $query->where('user_id', $userId);
        }

        if (!empty($casino_id)) {
            if(isset($casinoNameCondition['casino_id'])) {
                $query->where("casino_id",$casinoNameCondition['casino_id'], $casino_id);
            }else{
                $query->where("casino_id", $casino_id);
            }
        }

        if(!empty($roundId)) {
            $query->where('round_id', $roundId);
        }

        if(!empty($roundId)) {
            $casinoBets = $query->groupBy('round_id')->where('deleted',0)->whereNull('winner')->get();
        }else{
            $casinoBets = $query->groupBy('casino_id')->where('deleted',0)->whereNull('winner')->get();
        }

        $exAmtTot = [
            'exposer' => 0,
        ];
        foreach ($casinoBets as $bet) {

            $exAmtArr = self::getExAmountCasinoForEachTeam($bet->user_id, $bet->casino_id, $roundId);

            if (isset($exAmtArr['ODDS'])) {
                $arr = array();
                foreach ($exAmtArr['ODDS'] as $key => $profitLos) {
                    if ($profitLos < 0) {
                        $arr[abs($profitLos)] = abs($profitLos);
                    }
                }
                if (is_array($arr) && count($arr) > 0) {
                    $exAmtTot['exposer'] += max($arr);
                }

                $exAmtTot['ODDS'] = $exAmtArr['ODDS'];
            }
        }

        $exAmtTot['exposer'] = abs($exAmtTot['exposer']);

        return $exAmtTot;
    }

    public function updateCasinoWinner($last10Results, $casino, $user = []){

        $resultArray = [];
        foreach ($last10Results as $result){
            $resultArray[$result['mid']] = intval($result['result']);
        }

        if(empty($user)) {
            $bets = CasinoBet::whereIn('round_id',array_keys($resultArray))->where('casino_id',$casino->id)->where('deleted',0)->whereNull('winner')->groupBy('round_id')->get();
        }else{
            $bets = CasinoBet::where("user_id",$user->id)->whereIn('round_id',array_keys($resultArray))->where('deleted',0)->where('casino_id',$casino->id)->groupBy('round_id')->whereNull('winner')->get();
        }

        foreach ($bets as $bet){

            $casinoExposer = self::getCasinoExAmount($bet->user_id, $casino->id, $bet->round_id);

            $odds = $casinoExposer['ODDS'];

            $totalExposer = $casinoExposer['exposer'];

            $winnerSid = $resultArray[$bet->round_id];

            //            dd($odds,$winnerSid);

            $teams = json_decode($bet->teams, true);

            if(isset($odds[$winnerSid])) {
                $winnerProfitLose = $odds[$winnerSid];
                if ($winnerProfitLose < 0) {
                    $lose = abs($winnerProfitLose);
                    $exposerToBeReturn = 0;
                    $profit = 0;
                } else {
                    $profit = abs($winnerProfitLose);
                    $exposerToBeReturn = $totalExposer;
                    $lose = 0;
                }

                foreach ($teams as $team) {
                    if($team['sid'] == $winnerSid) {
                        $winner = $team['nat'];
                        break;
                    }
                }
            }else {
                $lose = abs($casinoExposer['exposer']) * 50 / 100;
                $exposerToBeReturn = $casinoExposer['exposer'] - $lose;
                $profit = 0;
                $winner = "Tie";
            }

            try {
                $masterAdmin = User::where("agent_level", "COM")->first();
                $adm_balance = $masterAdmin->available_balance;
                $admin_profit = 0;
                $admin_loss = 0;

                $player = User::where('id', $bet->user_id)->first();
                $available_balance = $player->available_balance;
                $player->exposer = $player->exposer - $totalExposer;
                $player->available_balance = (($player->available_balance + $profit + $exposerToBeReturn));

                if ($profit > 0) {

                    $commission_amount = 0;

                    $player->remaining_balance = (($player->remaining_balance + $profit) - $commission_amount);
                    $player->available_balance = ($player->available_balance - $commission_amount);

                    UserAccount::create([
                        'user_id' => $bet->user_id,
                        'from_user_id' => $bet->user_id,
                        'to_user_id' => $bet->user_id,
                        'commission_amount' => $commission_amount,
                        'credit_amount' => $profit,
                        'balance' => $available_balance + $profit,
                        'match_type' => "CASINO",
                        'bet_type' => "ODDS",
                        'match_id' => $casino->id,
                        'bet_market_id' => $bet->round_id,
                        'bet_user_id' => $bet->user_id,
                        'bet_selection' => $bet->selection
                    ]);

                    UserAccount::create([
                        'user_id' => $masterAdmin->id,
                        'from_user_id' => $bet->user_id,
                        'to_user_id' => $masterAdmin->id,
                        'commission_amount' => $commission_amount,
                        'debit_amount' => $profit,
                        'balance' => $adm_balance - $profit,
                        'match_type' => "CASINO",
                        'bet_type' => "ODDS",
                        'match_id' => $casino->id,
                        'bet_market_id' => $bet->round_id,
                        'bet_user_id' => $bet->user_id,
                        'bet_selection' => $bet->selection
                    ]);

                    $admin_loss += $profit;
                    $admin_profit += $commission_amount;

                }
                else {
                    $player->remaining_balance = $player->remaining_balance - $lose;

                    UserAccount::create([
                        'user_id' => $bet->user_id,
                        'from_user_id' => $bet->user_id,
                        'to_user_id' => $bet->user_id,
                        'debit_amount' => $lose,
                        'balance' => $available_balance - $lose,
                        'match_type' => "CASINO",
                        'bet_type' => "ODDS",
                        'match_id' => $casino->id,
                        'bet_market_id' => $bet->round_id,
                        'bet_user_id' => $bet->user_id,
                        'bet_selection' => $bet->selection
                    ]);

                    UserAccount::create([
                        'user_id' => $masterAdmin->id,
                        'from_user_id' => $bet->user_id,
                        'to_user_id' => $masterAdmin->id,
                        'credit_amount' => $lose,
                        'balance' => $adm_balance + $lose,
                        'match_type' => "CASINO",
                        'bet_type' => "ODDS",
                        'match_id' => $casino->id,
                        'bet_market_id' => $bet->round_id,
                        'bet_user_id' => $bet->user_id,
                        'bet_selection' => $bet->selection
                    ]);

                    $admin_profit += $lose;
                }

                $player->save();

                if ($admin_loss > 0 || $admin_profit > 0) {
                    $new_balance = $adm_balance + $admin_profit - $admin_loss;
                    $masterAdmin->remaining_balance = $new_balance;
                    $masterAdmin->available_balance = $new_balance;
                    $masterAdmin->save();
                }
            }catch (\Exception $e){
                Log::error($e->getMessage()." == ".$e->getTrace());
            }

            CasinoBet::where('casino_id',$bet->casino_id)->where("round_id",$bet->round_id)->update(['result_declare'=>1,'processing_status'=>'completed','winner'=>$winner]);
        }

        return ['status'=>true,'message'=>'Result declare successfully'];
    }

    public static function getAwcCasinoExAmount($userId)
    {

        $query = AwcCasinoBet::query();

        if(is_array($userId)){
            $query->whereIn('user_id', $userId);
        }else{
            $query->where('user_id', $userId);
        }

        return $query->where('deleted',0)->where('result_declare',false)->whereNull('winner')->sum('amount');
    }

    public function updateAwcCasinoWinner($userId, $records){
        foreach ($records as $data) {
            if(isset($data['betType']) && !empty($data['betType']) && $data['betType']!=NULL) {
                $selection = $data['betType'];
            }else{
                $selection = $data['platformTxId'];
            }
            if($data['platform'] == "JILI"){
                $bets = AwcCasinoBet::where('user_id', $userId)->where('round_id', $data['roundId'])->where('deleted', 0)->whereNull('winner')->limit(1)->get();
            } else {
                $bets = AwcCasinoBet::where('user_id', $userId)->where('round_id', $data['roundId'])->where('selection',$selection)->where('deleted', 0)->whereNull('winner')->get();
            }
            foreach ($bets as $bet) {
                $totalExposer = $data['betAmount']; 
                $lose = 0;
                $profit = 0;
                $exposerToBeReturn = 0;
                if ($data['winAmount'] > 0) {
                    $profit = $data['winAmount'] - $totalExposer;
                    $exposerToBeReturn = $totalExposer;
                } else {
                    $lose = $totalExposer;
                }

                $winner = "";
                if(isset($data['gameInfo']['winner'])) {
                    $winner = $data['gameInfo']['winner'];
                }elseif($data['gameName'] == 'CockFight_PHI' && isset($data['gameInfo']['matchResult'])) {
                    $winner = $data['gameInfo']['matchResult'];
                }

                if($data['platform'] == "KINGMAKER"){
                    \Log::info("profit => " . $profit);
                    if(isset($data['gameInfo']['profit']) && $data['gameInfo']['profit'] > 0) {
                        $winner = "WINNER";
                    }
                    else{
                        $winner = "LOSE";
                    }
                }

                if($data['platform'] == "JILI"){
                    if(isset($data['winAmount']) && $data['winAmount'] > 0) {
                        $winner = "WINNER";
                    }
                    else{
                        $winner = "LOSE";
                    }
                }

                if(isset($winner)) {

                    try {
                        $masterAdmin = User::where("agent_level", "COM")->first();
                        $adm_balance = $masterAdmin->available_balance;
                        $admin_profit = 0;
                        $admin_loss = 0;

                        $player = User::where('id', $bet->user_id)->first();
                        $available_balance = $player->available_balance;
                        $player->exposer = $player->exposer - $totalExposer;
                        $player->available_balance = (($player->available_balance + $profit + $exposerToBeReturn));

                        if ($profit > 0) {

                            if(empty($winner)){
                                $winner = "WINNER";
                            }

                            $commission_amount = 0;

                            $player->remaining_balance = (($player->remaining_balance + $profit) - $commission_amount);
                            $player->available_balance = ($player->available_balance - $commission_amount);

                            UserAccount::create([
                                'user_id' => $bet->user_id,
                                'from_user_id' => $bet->user_id,
                                'to_user_id' => $bet->user_id,
                                'commission_amount' => $commission_amount,
                                'credit_amount' => $profit,
                                'balance' => $available_balance + $profit,
                                'match_type' => "awc-casino",
                                'bet_type' => "ODDS",
                                'match_id' => $bet->id,
                                'bet_market_id' => $bet->round_id,
                                'bet_user_id' => $bet->user_id,
                                'bet_selection' => $bet->selection
                            ]);

                            UserAccount::create([
                                'user_id' => $masterAdmin->id,
                                'from_user_id' => $bet->user_id,
                                'to_user_id' => $masterAdmin->id,
                                'commission_amount' => $commission_amount,
                                'debit_amount' => $profit,
                                'balance' => $adm_balance - $profit,
                                'match_type' => "awc-casino",
                                'bet_type' => "ODDS",
                                'match_id' => $bet->id,
                                'bet_market_id' => $bet->round_id,
                                'bet_user_id' => $bet->user_id,
                                'bet_selection' => $bet->selection
                            ]);

                            $admin_loss += $profit;
                            $admin_profit += $commission_amount;

                        } else {
                            if(empty($winner)){
                                $winner = "LOSE";
                            }
                            $player->remaining_balance = $player->remaining_balance - $lose;

                            UserAccount::create([
                                'user_id' => $bet->user_id,
                                'from_user_id' => $bet->user_id,
                                'to_user_id' => $bet->user_id,
                                'debit_amount' => $lose,
                                'balance' => $available_balance - $lose,
                                'match_type' => "awc-casino",
                                'bet_type' => "ODDS",
                                'match_id' => $bet->id,
                                'bet_market_id' => $bet->round_id,
                                'bet_user_id' => $bet->user_id,
                                'bet_selection' => $bet->selection
                            ]);

                            UserAccount::create([
                                'user_id' => $masterAdmin->id,
                                'from_user_id' => $bet->user_id,
                                'to_user_id' => $masterAdmin->id,
                                'credit_amount' => $lose,
                                'balance' => $adm_balance + $lose,
                                'match_type' => "awc-casino",
                                'bet_type' => "ODDS",
                                'match_id' => $bet->id,
                                'bet_market_id' => $bet->round_id,
                                'bet_user_id' => $bet->user_id,
                                'bet_selection' => $bet->selection
                            ]);

                            $admin_profit += $lose;
                        }

                        $player->save();

                        if ($admin_loss > 0 || $admin_profit > 0) {
                            $new_balance = $adm_balance + $admin_profit - $admin_loss;
                            $masterAdmin->remaining_balance = $new_balance;
                            $masterAdmin->available_balance = $new_balance;
                            $masterAdmin->save();
                        }
                    } catch (\Exception $e) {
                        Log::error($e->getMessage() . " == " . $e->getTrace());
                    }

                    AwcCasinoBet::where('id', $bet->id)->update(['result_declare' => 1, 'winner' => $winner]);
                    if($data['platform'] == "JILI"){
                        AwcCasinoBet::where('round_id', $bet->round_id)->where('user_id', $bet->user_id)->where('result_declare', 0)->update(['result_declare' => 1, 'winner' => 'JILI']);
                    }
                } else {
                    \Log::info('winner not set');
                }
            }
        }

        return ['status'=>true,'message'=>'Result declare successfully'];
    }

}
