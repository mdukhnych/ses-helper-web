import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  firestore: { kind: "firestore" },
}));

vi.mock("@/firebaseConfig", () => ({
  FIREBASE_FIRESTORE: mocks.firestore,
}));

vi.mock("firebase/firestore", () => ({
  collection: (...args: unknown[]) => mocks.collection(...args),
  getDocs: (...args: unknown[]) => mocks.getDocs(...args),
}));

import reducer, {
  fetchEasyProData,
  fetchEktaServicesData,
  fetchPhoneServicesData,
  fetchServices,
  fetchWarrantyData,
  resestServicesStore,
  setEasyproPricelist,
  setEktaServicesData,
  setPhoneServicesData,
  setServicesStore,
  setWarrantyDataStore,
} from "./servicesSlice";

describe("servicesSlice", () => {
  beforeEach(() => {
    mocks.collection.mockReset();
    mocks.getDocs.mockReset();
    mocks.collection.mockImplementation((...args: unknown[]) => args.join("/"));
  });

  it("fetches the root services collection", async () => {
    mocks.getDocs.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "easy-pro",
          data: () => ({
            title: "Easy Pro",
            type: "easypro",
            data: { description: [], pricelist: [] },
          }),
        },
      ],
    });

    const action = await fetchServices()(vi.fn(), vi.fn(), undefined);

    expect(mocks.collection).toHaveBeenCalledWith(mocks.firestore, "services");
    expect(action.type).toBe(fetchServices.fulfilled.type);
    expect(action.payload).toEqual([
      {
        id: "easy-pro",
        title: "Easy Pro",
        type: "easypro",
        data: { description: [], pricelist: [] },
      },
    ]);
  });

  it("rejects service fetch when the collection is empty", async () => {
    mocks.getDocs.mockResolvedValue({
      empty: true,
      docs: [],
    });

    const action = await fetchServices()(vi.fn(), vi.fn(), undefined);

    expect(action.type).toBe(fetchServices.rejected.type);
  });

  it("fetches warranty data entries", async () => {
    mocks.getDocs.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "warranty-1",
          data: () => ({
            title: "Premium",
            price: 0.2,
            description: "Coverage",
          }),
        },
      ],
    });

    const action = await fetchWarrantyData()(vi.fn(), vi.fn(), undefined);

    expect(action.type).toBe(fetchWarrantyData.fulfilled.type);
    expect(action.payload).toEqual([
      {
        id: "warranty-1",
        title: "Premium",
        price: 0.2,
        description: "Coverage",
      },
    ]);
  });

  it("fetches easy pro description and pricelist data", async () => {
    mocks.getDocs
      .mockResolvedValueOnce({
        docs: [
          {
            data: () => ({
              model: "Galaxy A55",
              easypro: 299,
            }),
          },
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: "description-1",
            data: () => ({
              title: "Overview",
              text: "Details",
            }),
          },
        ],
      });

    const action = await fetchEasyProData()(vi.fn(), vi.fn(), undefined);

    expect(action.type).toBe(fetchEasyProData.fulfilled.type);
    expect(action.payload).toEqual({
      description: [
        {
          id: "description-1",
          title: "Overview",
          text: "Details",
        },
      ],
      pricelist: [
        {
          model: "Galaxy A55",
          easypro: 299,
        },
      ],
    });
  });

  it("fetches phone services data", async () => {
    mocks.getDocs
      .mockResolvedValueOnce({
        docs: [
          {
            id: "goods-1",
            data: () => ({
              title: "Insurance",
            }),
          },
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: "service-1",
            data: () => ({
              title: "Repair",
              price: 100,
              items: [],
            }),
          },
        ],
      });

    const action = await fetchPhoneServicesData()(vi.fn(), vi.fn(), undefined);

    expect(action.type).toBe(fetchPhoneServicesData.fulfilled.type);
    expect(action.payload).toEqual({
      goodsAndServices: [
        {
          id: "goods-1",
          title: "Insurance",
        },
      ],
      servicesItems: [
        {
          id: "service-1",
          title: "Repair",
          price: 100,
          items: [],
        },
      ],
    });
  });

  it("fetches ekta service groups", async () => {
    mocks.getDocs.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "group-1",
          data: () => ({
            title: "Ekta group",
            list: [],
          }),
        },
      ],
    });

    const action = await fetchEktaServicesData()(vi.fn(), vi.fn(), undefined);

    expect(action.type).toBe(fetchEktaServicesData.fulfilled.type);
    expect(action.payload).toEqual([
      {
        id: "group-1",
        title: "Ekta group",
        list: [],
      },
    ]);
  });

  it("stores the entire services payload", () => {
    const payload = [
      {
        id: "easy-pro",
        title: "Easy Pro",
        type: "easypro" as const,
        data: {
          description: [],
          pricelist: [],
        },
      },
    ];

    const nextState = reducer(undefined, setServicesStore(payload));

    expect(nextState.data).toEqual(payload);
  });

  it("updates warranty data for the matching service", () => {
    const state = {
      loading: false,
      error: null,
      data: [
        {
          id: "warranty-protection",
          title: "Warranty",
          type: "warranty" as const,
          data: [],
        },
      ],
    };
    const payload = [
      {
        id: "warranty-1",
        title: "Premium",
        price: 199,
        description: "Coverage",
      },
    ];

    const nextState = reducer(state, setWarrantyDataStore(payload));

    expect(nextState.data[0].data).toEqual(payload);
  });

  it("keeps state unchanged when warranty service is missing", () => {
    const state = {
      loading: false,
      error: null,
      data: [],
    };

    expect(reducer(state, setWarrantyDataStore([]))).toEqual(state);
  });

  it("updates easy pro pricelist items without replacing the rest of the service", () => {
    const state = {
      loading: false,
      error: null,
      data: [
        {
          id: "easy-pro",
          title: "Easy Pro",
          type: "easypro" as const,
          data: {
            description: [
              {
                id: "description-1",
                title: "Overview",
                text: "Details",
              },
            ],
            pricelist: [],
          },
        },
      ],
    };
    const payload = [
      {
        model: "Galaxy A55",
        easypro: 299,
      },
    ];

    const nextState = reducer(state, setEasyproPricelist(payload));
    const easyProData = nextState.data[0].data as {
      description: Array<{ id: string; title: string; text: string }>;
      pricelist: Array<{ model: string; easypro?: number }>;
    };

    expect(easyProData.pricelist).toEqual(payload);
    expect(easyProData.description).toHaveLength(1);
  });

  it("updates phone services data", () => {
    const state = {
      loading: false,
      error: null,
      data: [
        {
          id: "phone-services",
          title: "Phone services",
          type: "phone" as const,
          nextID: 2,
          data: {
            goodsAndServices: [],
            servicesItems: [],
          },
        },
      ],
    };
    const payload = {
      goodsAndServices: [{ id: "goods-1", title: "Insurance" }],
      servicesItems: [],
    };

    const nextState = reducer(state, setPhoneServicesData(payload));

    expect(((nextState.data[0] as unknown) as { data: typeof payload }).data).toEqual(payload);
  });

  it("updates ekta services data", () => {
    const state = {
      loading: false,
      error: null,
      data: [
        {
          id: "ekta-services",
          title: "Ekta",
          type: "ekta" as const,
          data: [],
        },
      ],
    };
    const payload = [
      {
        id: "group-1",
        title: "Ekta group",
        list: [],
      },
    ];

    const nextState = reducer(state, setEktaServicesData(payload));

    expect(((nextState.data[0] as unknown) as { data: typeof payload }).data).toEqual(payload);
  });

  it("handles async reducer matchers for pending, fulfilled and rejected actions", () => {
    const pendingState = reducer(undefined, fetchServices.pending("req-1", undefined));
    const fulfilledState = reducer(
      pendingState,
      fetchServices.fulfilled(
        [
          {
            id: "easy-pro",
            title: "Easy Pro",
            type: "easypro",
            data: { description: [], pricelist: [] },
          },
        ],
        "req-1",
        undefined,
      ),
    );
    const rejectedState = reducer(
      fulfilledState,
      fetchServices.rejected(new Error("Load failed"), "req-1", undefined),
    );

    expect(pendingState.loading).toBe(true);
    expect(fulfilledState.loading).toBe(false);
    expect(fulfilledState.data).toHaveLength(1);
    expect(rejectedState.loading).toBe(false);
    expect(rejectedState.error).toBe("Load failed");
  });

  it("applies fulfilled async payloads to nested services", () => {
    const state = {
      loading: false,
      error: null,
      data: [
        {
          id: "warranty-protection",
          title: "Warranty",
          type: "warranty" as const,
          data: [],
        },
        {
          id: "easy-pro",
          title: "Easy Pro",
          type: "easypro" as const,
          data: {
            description: [],
            pricelist: [],
          },
        },
        {
          id: "phone-services",
          title: "Phone services",
          type: "phone" as const,
          nextID: 2,
          data: {
            goodsAndServices: [],
            servicesItems: [],
          },
        },
        {
          id: "ekta-services",
          title: "Ekta",
          type: "ekta" as const,
          data: [],
        },
      ],
    };

    const withWarranty = reducer(
      state,
      fetchWarrantyData.fulfilled(
        [{ id: "warranty-1", title: "Premium", price: 0.2, description: "Coverage" }],
        "req-1",
        undefined,
      ),
    );
    const withEasyPro = reducer(
      withWarranty,
      fetchEasyProData.fulfilled(
        {
          description: [{ id: "description-1", title: "Overview", text: "Details" }],
          pricelist: [{ model: "Galaxy A55", easypro: 299 }],
        },
        "req-1",
        undefined,
      ),
    );
    const withPhone = reducer(
      withEasyPro,
      fetchPhoneServicesData.fulfilled(
        {
          goodsAndServices: [{ id: "goods-1", title: "Insurance" }],
          servicesItems: [{ id: "service-1", title: "Repair", price: 100, items: [] }],
        },
        "req-1",
        undefined,
      ),
    );
    const withEkta = reducer(
      withPhone,
      fetchEktaServicesData.fulfilled(
        [{ id: "group-1", title: "Ekta group", list: [] }],
        "req-1",
        undefined,
      ),
    );

    expect(((withEkta.data[0] as unknown) as { data: unknown[] }).data).toHaveLength(1);
    expect(
      (((withEkta.data[1] as unknown) as { data: { pricelist: unknown[] } }).data.pricelist),
    ).toHaveLength(1);
    expect(
      ((((withEkta.data[2] as unknown) as { data: { goodsAndServices: unknown[] } }).data.goodsAndServices)),
    ).toHaveLength(1);
    expect(((withEkta.data[3] as unknown) as { data: unknown[] }).data).toHaveLength(1);
  });

  it("resets the slice to its initial state", () => {
    const dirtyState = {
      loading: true,
      error: "Something failed",
      data: [
        {
          id: "easy-pro",
          title: "Easy Pro",
          type: "easypro" as const,
          data: {
            description: [],
            pricelist: [],
          },
        },
      ],
    };

    expect(reducer(dirtyState, resestServicesStore())).toEqual({
      loading: false,
      error: null,
      data: [],
    });
  });
});
