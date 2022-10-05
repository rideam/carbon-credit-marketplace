<template>
  <Toast position="top-right"/>
  <div class="grid">
    <div class="col-12 md:col-3">
      <Dialog header="Request Form"
              v-model:visible="display"
              :breakpoints="{'960px': '75vw'}"
              :style="{width: '30vw'}" :modal="true">

        <div class=" p-fluid">
          <div class="col-12">
            <div class="p-inputgroup">
                    <span class="p-inputgroup-addon">
                        <i class="pi pi-user"></i>
                    </span>
              <InputText placeholder="Member ID"
                         type="number"
                         v-model="memberid"/>
            </div>
          </div>

          <div class="col-12">
            <div class="p-inputgroup">
                    <span class="p-inputgroup-addon">
                      <i class="pi pi-external-link"></i>
                    </span>
              <InputText placeholder="Amount of Carbon Credits"
                         v-model="amount"/>
            </div>
          </div>

          <!--                <div class="col-12">
                            <div class="p-inputgroup">
                              <span class="p-inputgroup-addon">
                                <i class="pi pi-external-link"></i>
                              </span>
                              <InputText placeholder="Physical Inspection Address"
                                         v-model="address"/>
                            </div>
                          </div>-->

        </div>


        <template #footer>
          <Button label="Request" @click="sendRequest" icon="pi pi-check" class="p-button-outlined"/>
        </template>
      </Dialog>
      <Button label="Request Carbon Credits" icon="pi pi-external-link" style="width: auto" @click="open"/>
    </div>

    <div class="col-12 lg:col-6 xl:col-3" v-if="dataloaded">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Balance</span>
            <div class="text-900 font-medium text-xl">{{ accountbalance }}</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
               style="width:2.5rem;height:2.5rem">
            <i class="pi pi-shopping-cart text-blue-500 text-xl"></i>
          </div>
        </div>
        <span class="text-green-500 font-medium">CCT </span>
        <span class="text-500">Tokens</span>
      </div>
    </div>

    <div class="col-12">
      <div class="card">
        <div class="grid p-fluid justify-content-end">
          <div class="col-12 md:col-3">
            <div class="p-inputgroup">
                    <span class="p-inputgroup-addon">
                        <i class="pi pi-user"></i>
                    </span>
              <InputText placeholder="Member ID" v-model="memberid"/>
            </div>
          </div>

          <div class="col-12 md:col-3">
            <Button
                label="My Account"
                icon="pi pi-wallet"
                class="mr-2 mb-2"
                @click="myAccount"
            ></Button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12" v-if="dataloaded">
      <div class="card">
        <div class="mt-5">
          <DataTable :value="requests">
            <template #header> Credit Requests</template>
            <Column
                v-for="col of requestsColumns"
                :field="col.field"
                :header="col.header"
                :key="col.field"
            >
              <template #body="slotProps" v-if="col.field === 'status'">
                <span :class="'customer-badge status-'+ slotProps.data.status">{{ slotProps.data.status }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    title: String,
  },
  data() {
    return {
      display: false,
      memberid: null,
      address: null,
      amount: null,
      accountbalance: null,
      dataloaded: false,
      requests: null,
      requestsColumns: null,
    }
  },
  methods: {
    open() {
      this.display = true;
    },
    close() {
      this.display = false;
    },
    sendRequest() {
      axios.post('/seller/requestcredit', {
            memberid: this.memberid,
            // address: this.address,
            amount: this.amount
          }
      ).then(res => {

        this.memberid = res.data.memberid;
        this.dataLoaded = true;

        this.$toast.add({
          severity: "success",
          summary: "Success",
          detail: `Request successful`,
          life: 4000,
        });

        this.close();

      }).catch(err => {
        console.log(err.message)
      })
    },
    myAccount() {
      axios.post('/api/myaccount', {
            memberid: this.memberid
          }
      ).then(res => {
        // console.log(res.data)
        this.accountbalance = res.data.balance;
        this.dataloaded = true;
      }).catch(err => {
        console.log(err.message)
        this.$toast.add({
          severity: "error",
          summary: "Error",
          detail: `Account not found`,
          life: 3000,
        });
      })

      this.myRequests();
    },
    myRequests() {
      axios.post("/seller/myrequests", {
            memberid: this.memberid
          }
      ).then((res) => {

        this.requests = res.data;

        this.requestsColumns = [
          {field: "memberid", header: "Member ID"},
          {field: "companyname", header: "Member"},
          {field: "wallet", header: "Wallet"},
          {field: "amount", header: "Amount"},
          {field: "status", header: "Status"},
        ];
      });
    }
  }
};
</script>
