/**
 * API Helper Functions
 *
 * Reusable utilities for API route handlers
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { Model } from "mongoose";
import { connectToDatabase } from "./mongodb";
import { PaginatedResponse, ApiResponse } from "@/types";

export { connectToDatabase };

/**
 * Generic GET all handler with pagination and search
 */
export async function handleGetAll<T>(
  request: NextRequest,
  model: Model<T>,
  searchFields: string[] = ["name"],
  populate?: string[]
) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Build query
    const query: any = {};
    if (search && searchFields.length > 0) {
      query.$or = searchFields.map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    let queryExec = model
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    if (populate && populate.length > 0) {
      populate.forEach((field) => {
        queryExec = queryExec.populate(field);
      });
    }

    const [data, total] = await Promise.all([
      queryExec.lean(),
      model.countDocuments(query),
    ]);

    const response: PaginatedResponse<any> = {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}

/**
 * Generic POST handler
 */
export async function handleCreate<T>(
  request: NextRequest,
  model: Model<T>,
  uniqueField?: string
) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Check for unique field if specified
    if (uniqueField && body[uniqueField]) {
      const existing = await model.findOne({
        [uniqueField]: body[uniqueField],
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: `${uniqueField} already exists` },
          { status: 409 }
        );
      }
    }

    const doc = await model.create(body);

    const response: ApiResponse<any> = {
      success: true,
      data: doc,
      message: "Created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("API POST error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create" },
      { status: 500 }
    );
  }
}

/**
 * Generic GET by ID handler
 */
export async function handleGetById<T>(
  id: string,
  model: Model<T>,
  populate?: string[]
) {
  try {
    await connectToDatabase();

    let query = model.findById(id);

    if (populate && populate.length > 0) {
      populate.forEach((field) => {
        query = query.populate(field);
      });
    }

    const doc = await query;

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<any> = {
      success: true,
      data: doc,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API GET by ID error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}

/**
 * Generic PUT handler
 */
export async function handleUpdate<T>(
  id: string,
  request: NextRequest,
  model: Model<T>,
  uniqueField?: string
) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Check for unique field if specified and being changed
    if (uniqueField && body[uniqueField]) {
      const existing = await model.findOne({
        [uniqueField]: body[uniqueField],
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: `${uniqueField} already exists` },
          { status: 409 }
        );
      }
    }

    const doc = await model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<any> = {
      success: true,
      data: doc,
      message: "Updated successfully",
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API PUT error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update" },
      { status: 500 }
    );
  }
}

/**
 * Generic DELETE handler
 */
export async function handleDelete<T>(id: string, model: Model<T>) {
  try {
    await connectToDatabase();

    const doc = await model.findByIdAndDelete(id);

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<any> = {
      success: true,
      message: "Deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete" },
      { status: 500 }
    );
  }
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    ...(data && { data }),
    ...(message && { message }),
  };
  return NextResponse.json(response, { status });
}
