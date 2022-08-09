<?php
header("Content-type:application/json; charset=utf8");
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

try {
    if($_SERVER["REQUEST_METHOD"] == "POST"){
        $data_json_str = file_get_contents("php://input");
        $contents = json_decode($data_json_str, true);
        $query = http_build_query($contents);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, "★FormのURL★");
        $result=curl_exec($ch);
        curl_close($ch);

        // 入場記録のjsonを保存
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_URL, "★GET★");
        $result=curl_exec($ch);
        curl_close($ch);

        file_put_contents("../../util/reception_data/accepted.json",$result);

        // レスポンス返す
        echo $data_json_str;
    } else {
        echo "{}";
    }
} catch (Exception $ex) {
    file_put_contents("out.log","エラーだ\n",FILE_APPEND);
    echo "{}";
}
