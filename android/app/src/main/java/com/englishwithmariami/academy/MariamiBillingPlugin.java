package com.englishwithmariami.academy;

import com.android.billingclient.api.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;
import java.util.Map;

/** Google Play supplies prices/purchase tokens. Only the backend grants access. */
@CapacitorPlugin(name = "MariamiBilling")
public class MariamiBillingPlugin extends Plugin {
    private static final String PRODUCT = "mariami_all_grades";
    private static final Map<String, String> PERIODS = Map.of(
        "monthly", "P1M", "quarterly", "P3M", "half-yearly", "P6M", "yearly", "P1Y");
    private BillingClient billing;
    private boolean connecting;
    private boolean buying;

    @Override public void load() {
        billing = BillingClient.newBuilder(getContext())
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection()
            .setListener((result, purchases) -> {
                buying = false;
                JSObject event = new JSObject();
                event.put("code", result.getResponseCode());
                event.put("purchases", serialize(purchases));
                notifyListeners("purchasesUpdated", event);
            }).build();
    }

    private JSArray serialize(List<Purchase> purchases) {
        JSArray rows = new JSArray();
        if (purchases != null) for (Purchase purchase : purchases) {
            if (!purchase.getProducts().contains(PRODUCT)) continue;
            JSObject row = new JSObject();
            row.put("token", purchase.getPurchaseToken());
            row.put("state", purchase.getPurchaseState());
            rows.put(row);
        }
        return rows;
    }

    private void connected(PluginCall call, Runnable action) {
        getActivity().runOnUiThread(() -> {
            if (billing.isReady()) { action.run(); return; }
            if (connecting) { call.reject("Google Play-სთან დაკავშირება მიმდინარეობს.", "BILLING_BUSY"); return; }
            connecting = true;
            billing.startConnection(new BillingClientStateListener() {
                @Override public void onBillingSetupFinished(BillingResult result) {
                    connecting = false;
                    if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) action.run();
                    else call.reject("Google Play გადახდები ამ მოწყობილობაზე მიუწვდომელია.", "BILLING_UNAVAILABLE");
                }
                @Override public void onBillingServiceDisconnected() { connecting = false; }
            });
        });
    }

    private void product(PluginCall call, java.util.function.Consumer<ProductDetails> callback) {
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder().setProductList(List.of(
            QueryProductDetailsParams.Product.newBuilder().setProductId(PRODUCT)
                .setProductType(BillingClient.ProductType.SUBS).build())).build();
        billing.queryProductDetailsAsync(params, (result, details) -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || details.getProductDetailsList().isEmpty()) {
                call.reject("გამოწერის გეგმები Google Play-ში ჯერ მიუწვდომელია.", "PRODUCT_UNAVAILABLE"); return;
            }
            callback.accept(details.getProductDetailsList().get(0));
        });
    }

    private boolean standard(ProductDetails.SubscriptionOfferDetails offer) {
        if (offer.getOfferId() != null || offer.getInstallmentPlanDetails() != null) return false;
        var phases = offer.getPricingPhases().getPricingPhaseList();
        if (phases.size() != 1) return false;
        var phase = phases.get(0);
        String expected = PERIODS.get(offer.getBasePlanId());
        // Play can express an annual period as P12M or P1Y.
        boolean period = expected != null && (expected.equals(phase.getBillingPeriod()) ||
            (expected.equals("P1Y") && phase.getBillingPeriod().equals("P12M")));
        return period && phase.getPriceAmountMicros() > 0 &&
            phase.getRecurrenceMode() == ProductDetails.RecurrenceMode.INFINITE_RECURRING;
    }

    @PluginMethod public void getPlans(PluginCall call) {
        connected(call, () -> product(call, details -> {
            JSArray plans = new JSArray();
            if (details.getSubscriptionOfferDetails() != null) for (var offer : details.getSubscriptionOfferDetails()) {
                if (!standard(offer)) continue;
                var phase = offer.getPricingPhases().getPricingPhaseList().get(0);
                JSObject plan = new JSObject();
                plan.put("id", offer.getBasePlanId());
                plan.put("price", phase.getFormattedPrice());
                plan.put("currency", phase.getPriceCurrencyCode());
                plan.put("period", phase.getBillingPeriod());
                plans.put(plan);
            }
            JSObject output = new JSObject(); output.put("plans", plans); call.resolve(output);
        }));
    }

    @PluginMethod public void purchase(PluginCall call) {
        String plan = call.getString("plan", "");
        String account = call.getString("account", "");
        if (!PERIODS.containsKey(plan) || !account.matches("[a-f0-9]{64}")) {
            call.reject("გამოწერის ან ანგარიშის მონაცემები არასწორია.", "INVALID_REQUEST"); return;
        }
        if (buying) { call.reject("გადახდა უკვე მიმდინარეობს.", "BILLING_BUSY"); return; }
        connected(call, () -> product(call, details -> {
            var offers = details.getSubscriptionOfferDetails();
            if (offers != null) for (var offer : offers) {
                if (!plan.equals(offer.getBasePlanId()) || !standard(offer)) continue;
                var selected = BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(details).setOfferToken(offer.getOfferToken()).build();
                var params = BillingFlowParams.newBuilder().setObfuscatedAccountId(account)
                    .setProductDetailsParamsList(List.of(selected)).build();
                getActivity().runOnUiThread(() -> {
                    if (buying) { call.reject("გადახდა უკვე მიმდინარეობს.", "BILLING_BUSY"); return; }
                    buying = true;
                    var result = billing.launchBillingFlow(getActivity(), params);
                    if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        buying = false; call.reject("Google Play-ის გადახდა ვერ გაიხსნა.", "BILLING_UNAVAILABLE");
                    } else call.resolve();
                });
                return;
            }
            call.reject("არჩეული გეგმა მიუწვდომელია.", "PLAN_UNAVAILABLE");
        }));
    }

    @PluginMethod public void restore(PluginCall call) {
        connected(call, () -> billing.queryPurchasesAsync(QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS).build(), (result, purchases) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject("შესყიდვების აღდგენა ვერ მოხერხდა.", "RESTORE_FAILED"); return;
                }
                JSObject output = new JSObject(); output.put("purchases", serialize(purchases)); call.resolve(output);
            }));
    }

    @Override protected void handleOnDestroy() {
        if (billing != null) billing.endConnection();
    }
}
