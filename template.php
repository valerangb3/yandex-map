<?php
/**
 * Created: 09.08.17, 14:29
 * Author : Dmitry Antiptsev <cto@34web.ru>
 * Company: 34web Studio
 */
?>

<div id="map_markers">
    <div class="sm">
        <div class="sm__in" id="<?= $arParams["MAP_ID"] ?>">
        </div>
    </div>
    <aside class="lm-map">
        <div class="lm-map__in">
            <div class="lm-map__head">
                <div class="lm-map__head-in">
                    <div class="lm-map__head-cnt">
							<span class="lm-map__menu">
								<span class="lm-map__menu-i"></span>
							</span>
                        <div class="lm-map__logo">
                            <a href="<?if($arParams["LANGUAGE"] == "en"):?>/en<?endif;?>/" class="lm-map__logo-i <?if($arParams["LANGUAGE"] == "en"):?>lm-map__logo-i_en<?endif;?>"></a>
                        </div>
                        <div class="buy_in_shop">
                            <a href="https://shop.voltyre-prom.ru/" class="s-btn s-btn_blue s-btn_medium s-btn_200">
                                <span class="s-btn__t"><?=GetMessage("BUY_IN_SHOP")?></span>
                            </a>
                        </div>
                        <div class="lm-map__title"><?=GetMessage("FIND_DEALER")?></div>
                    </div>
                </div>
            </div>
            <div class="lm-map__location">
                <div class="lm-map__location-in">
                    <div class="lm-map__location-cnt">
                        <div class="lm-map__location-row">
                            <span class="lm-map__location-lbl"><?=GetMessage("YOUR_LOC")?>:</span>
                            <span class="lm-map__location-btn" id="<?= $arParams["MAP_ID"] ?>_get_location">
									<span class="s-btn s-btn_locate">
										<span class="s-btn__t"><?=GetMessage("IDENTIFY")?></span>
									</span>
								</span>
                        </div>
                        <span class="lm-map__location-fld">
								<input id="<?= $arParams["MAP_ID"] ?>_select_address" type="text" class="s-form-text" placeholder="<?=GetMessage("ENTER_LOCATION")?>" autocomplete="off">
							</span>
                    </div>
                </div>
            </div>
            <div class="lm-map__dealers">
                <div class="lm-map__dealers-in">
                    <div class="lm-map__dealers-cnt">
                        <div class="lm-map__dealers-scroll" id="<?= $arParams["MAP_ID"] ?>_list_points">
                        </div>
                    </div>
                </div>
            </div>
            <div class="lm-map__open hide_desktop">
                <div class="lm-map__open-in">
                    <div class="lm-map__open-cnt">
							<span class="s-btn s-btn_light-blue s-btn_medium s-btn_full">
								<span class="s-btn__t"><?=GetMessage("SHOW_LIST_DEALER")?></span>
							</span>
                    </div>
                </div>
            </div>
            <div class="lm-map__footer hide_no-desktop">
                <div class="lm-map__footer-in">
                    <div class="lm-map__footer-cnt">
                        <div class="lm-map__phone _i-phone">
                            <div class="lm-map__phone-lbl"><?//=GetMessage("TOLL_FREE")?>
								<?
								$APPLICATION->IncludeComponent(
									"bitrix:main.include",
									"",
									Array(
										"AREA_FILE_SHOW" => "file",
										"PATH" => "/local/include/".LANGUAGE_ID."/main/free_bell.php",
										"EDIT_TEMPLATE" => ""
									),
								false
								);?>								
							</div>
                            <div class="lm-map__phone-val">
								<?
								$APPLICATION->IncludeComponent(
									"bitrix:main.include",
									"",
									Array(
										"AREA_FILE_SHOW" => "file",
										"PATH" => "/local/include/".LANGUAGE_ID."/main/phone_header.php",
										"EDIT_TEMPLATE" => ""
									),
								false
								);?>							
							</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="lm-map__bottom">
                <div class="lm-map__bottom-in">
                    <div class="lm-map__bottom-cnt">
                        <span class="lm-map-open"></span>
                    </div>
                </div>
            </div>
        </div>
    </aside>
    <aside class="lm lm_fullscreen">
        <? $APPLICATION->IncludeComponent(
            "bitrix:main.include",
            "",
            Array(
                "AREA_FILE_SHOW" => "file",
                "PATH" => "/include/main/mobile_menu.php",
                "EDIT_TEMPLATE" => ""
            ),
            false
        ); ?>
    </aside>
    <aside class="lm-cover"></aside>
</div>
<script type="text/javascript">
    <?if(!empty($arParams["MAP_ID"]) && !empty($arResult['MAPS_SCRIPT_URL'])):?>
    var map_obj;
    function BXMapLoader_<?=$arParams['MAP_ID']?>() {

        map_obj = BX.mapMarkersComponent.init({
            params: <?=CUtil::PhpToJSObject(array(
                "mapId" => $arParams["MAP_ID"],
                "mapType" => strtolower($arParams["MAP_TYPE"]),
                "mapControls" => $arParams["MAP_CONTROLS"],
                "mapOptions" => $arParams["MAP_OPTIONS"],
                "defaultMapPosition" => $arResult['POSITION'],
                "countNearestPoints" => 15,
                "templatePath" => $templateFolder,
				"lang" => $arParams["LANGUAGE"]
            )
        )?>,
            points: <?=CUtil::PhpToJSObject($arResult["POINTS"])?>,
        });

        BX.loadScript('<?=$arResult['MAPS_SCRIPT_URL']?>', function () {
            map_obj.waitForMap();
        });
    }

    BX.ready(BXMapLoader_<?=$arParams['MAP_ID']?>);
    <?endif?>

</script>