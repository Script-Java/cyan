import { RequestHandler } from "express";
import { shipstationAPI } from "../utils/shipstation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

export const handleCreateLabel: RequestHandler = async (req, res) => {
  try {
    const { orderId, carrier, service, weight, dimensions, testLabel } =
      req.body;

    if (!orderId || !carrier || !service || !weight) {
      return res.status(400).json({
        error:
          "Missing required fields: orderId, carrier, service, weight are required",
      });
    }

    // Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return res
        .status(404)
        .json({ error: "Order not found" });
    }

    // Get shipping address from order
    const shippingAddress = order.shipping_addresses?.[0];
    if (!shippingAddress) {
      return res
        .status(400)
        .json({
          error: "Order does not have shipping address information",
        });
    }

    // Prepare shipment payload for ShipStation
    const shipmentPayload = {
      orderId: orderId.toString(),
      carrierCode: carrier,
      serviceCode: service,
      packageCode: "package", // Default package code
      weight: {
        value: weight,
        units: "ounces",
      },
      ...(dimensions && {
        dimensions: {
          length: dimensions.length || 0,
          width: dimensions.width || 0,
          height: dimensions.height || 0,
          units: "inches",
        },
      }),
      toAddress: {
        name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        street1: shippingAddress.street_1,
        street2: shippingAddress.street_2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state_or_province,
        postalCode: shippingAddress.postal_code,
        country: shippingAddress.country_iso2 || "US",
        phone: shippingAddress.phone || "",
      },
      ...(testLabel && { testLabel: true }),
    };

    // Create shipping label
    const labelResponse = await shipstationAPI.createShippingLabel(
      shipmentPayload
    );

    // Store label info in database
    if (labelResponse.labelDownload?.href || labelResponse.tracking) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          shipping_label_url: labelResponse.labelDownload?.href,
          tracking_number: labelResponse.tracking || "",
          tracking_carrier: carrier,
          shipped_date: new Date().toISOString(),
          status: "in transit",
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Failed to update order with label info:", updateError);
      }
    }

    return res.status(200).json({
      success: true,
      labelId: labelResponse.labelId,
      tracking: labelResponse.tracking,
      labelUrl: labelResponse.labelDownload?.href,
    });
  } catch (error) {
    console.error("Failed to create shipping label:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create shipping label";
    res.status(500).json({ error: errorMessage });
  }
};

export const handleGetRates: RequestHandler = async (req, res) => {
  try {
    const { orderId, weight, dimensions } = req.body;

    if (!orderId || !weight) {
      return res
        .status(400)
        .json({ error: "Missing required fields: orderId, weight" });
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return res
        .status(404)
        .json({ error: "Order not found" });
    }

    const shippingAddress = order.shipping_addresses?.[0];
    if (!shippingAddress) {
      return res
        .status(400)
        .json({
          error: "Order does not have shipping address information",
        });
    }

    // Get rates from ShipStation
    const ratesPayload = {
      carrierCode: "usps",
      fromPostalCode: "90210", // Default warehouse postal code
      toState: shippingAddress.state_or_province,
      toPostalCode: shippingAddress.postal_code,
      toCountry: shippingAddress.country_iso2 || "US",
      weight: {
        value: weight,
        units: "ounces",
      },
      ...(dimensions && {
        dimensions: {
          length: dimensions.length || 0,
          width: dimensions.width || 0,
          height: dimensions.height || 0,
          units: "inches",
        },
      }),
    };

    const rates = await shipstationAPI.getRates(ratesPayload);

    return res.status(200).json({ rates });
  } catch (error) {
    console.error("Failed to get rates:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get rates";
    res.status(500).json({ error: errorMessage });
  }
};

export const handleGetCarriers: RequestHandler = async (req, res) => {
  try {
    const carriers = await shipstationAPI.getCarriers();
    res.status(200).json({ carriers });
  } catch (error) {
    console.error("Failed to get carriers:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get carriers";
    res.status(500).json({ error: errorMessage });
  }
};

export const handleGetServices: RequestHandler = async (req, res) => {
  try {
    const { carrierCode } = req.query;

    if (!carrierCode) {
      return res
        .status(400)
        .json({ error: "carrierCode is required" });
    }

    const services = await shipstationAPI.getServices(carrierCode as string);
    res.status(200).json({ services });
  } catch (error) {
    console.error("Failed to get services:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get services";
    res.status(500).json({ error: errorMessage });
  }
};
